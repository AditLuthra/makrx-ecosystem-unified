"""
MakrX Services Backend - Unified Service Platform
Handles 3D printing, laser engraving, and future manufacturing services
"""

from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import asyncio
import logging
import os
import time
import uuid
import uvicorn
import structlog
from contextlib import asynccontextmanager
from pathlib import Path
from sqlalchemy import text

from app.core.config import get_settings
from app.core.database import engine, SessionLocal
from app.core.security import get_current_user, require_roles
from app.models import Base
from app.routes import (
    orders,
    providers,
    upload
)
from app.routers import feature_flags, services
from app.features import FeatureFlagMiddleware, feature_manager

# Configure structlog for structured logging
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logging.basicConfig(level=logging.INFO, handlers=[structlog.stdlib.ProcessorFormatter.wrap_for_formatter(structlog.processors.JSONRenderer())])
logger = structlog.get_logger(__name__)

settings = get_settings()

# Create upload directories
upload_dirs = [
    "uploads/stl",
    "uploads/svg", 
    "uploads/previews",
    "uploads/images"
]

for dir_path in upload_dirs:
    Path(dir_path).mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    logger.info("Starting MakrX Services Backend...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize feature flags system
    logger.info("Loading feature flags configuration...")
    feature_manager.load_configuration()
    logger.info(f"Loaded {len(feature_manager.get_flags_summary()['flags'])} feature flags")
    
    # Start background tasks (uncomment when implementing background jobs)
    # asyncio.create_task(start_job_dispatcher())
    
    logger.info("Services backend startup complete")
    yield
    
    logger.info("Shutting down MakrX Services Backend...")
    # Save feature flags configuration
    feature_manager.save_configuration()

# Initialize FastAPI app
app = FastAPI(
    title="MakrX Services API",
    description="Unified platform for 3D printing, laser engraving, and manufacturing services",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Security middleware
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["services.makrx.store", "localhost", "127.0.0.1"]
    )

# CORS middleware
default_allowed_origins = [
    "https://services.makrx.store",
    "https://makrx.store",
]

allowed_origins = list(default_allowed_origins)

env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    for o in [o.strip() for o in env_origins.split(",") if o.strip()]:
        if o not in allowed_origins:
            allowed_origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
)

# Feature flag middleware
app.add_middleware(FeatureFlagMiddleware, manager=feature_manager)

# Request middleware with request_id and structlog context enrichment
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    structlog.contextvars.bind_contextvars(request_id=request_id)
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{process_time:.2f}ms"
    structlog.contextvars.clear_contextvars()
    return response

# Custom middleware (uncomment when implementing)
# app.add_middleware(PrometheusMiddleware)
# app.add_middleware(LoggingMiddleware)

# Static file serving
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "path": request.url.path
        }
    )

# Readiness probe
@app.get("/healthz", status_code=status.HTTP_200_OK)
async def readiness_check():
    db_ok = False
    redis_ok = False
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_ok = True
    except Exception as e:
        logger.error("Database readiness check failed", error=str(e))

    try:
        from app.core.redis import check_redis_connection
        redis_ok = await check_redis_connection()
    except Exception as e:
        logger.error("Redis readiness check failed", error=str(e))

    if db_ok and redis_ok:
        return {"status": "healthy", "database": "ok", "redis": "ok"}
    else:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "database": "ok" if db_ok else "unhealthy",
                "redis": "ok" if redis_ok else "unhealthy",
            },
        )

# Liveness probe
@app.get("/health", status_code=status.HTTP_200_OK)
async def liveness_check():
    return {"status": "healthy", "service": "makrx-services-backend"}

# Metrics endpoint
@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
    from fastapi import Response
    
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# API routes
app.include_router(feature_flags.router, tags=["feature-flags"])
app.include_router(services.router, tags=["services"])
app.include_router(orders.router, prefix="/api", tags=["orders"])
app.include_router(providers.router, prefix="/api", tags=["providers"])
app.include_router(upload.router, prefix="/api", tags=["upload"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "MakrX Services API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if settings.DEBUG else None
    }

# Cross-platform integration endpoints
@app.post("/api/orders/{order_id}/sync", dependencies=[Depends(require_roles(["admin", "service_provider"]))])
async def sync_order_with_store(
    order_id: str,
    current_user = Depends(get_current_user)
):
    """Sync service order with main MakrX Store"""
    try:
        from app.services.store_integration import sync_order_with_store
        await sync_order_with_store(order_id, current_user.id)
        return {"status": "synced", "order_id": order_id}
    except Exception as e:
        logger.error(f"Failed to sync order {order_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to sync with store")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8006,
        reload=settings.DEBUG,
        log_config={
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "json_formatter": {
                    "()": structlog.stdlib.ProcessorFormatter,
                    "processor": structlog.processors.JSONRenderer(),
                }
            },
            "handlers": {
                "default": {
                    "formatter": "json_formatter",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                }
            },
            "loggers": {
                "uvicorn.access": {
                    "handlers": ["default"],
                    "level": "INFO",
                    "propagate": False,
                },
                "uvicorn.error": {
                    "handlers": ["default"],
                    "level": "INFO",
                    "propagate": False,
                },
            },
        },
    )