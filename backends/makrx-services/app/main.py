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
import uvicorn
from contextlib import asynccontextmanager
from pathlib import Path

from app.core.config import get_settings
from app.core.database import engine, SessionLocal
from app.core.security import get_current_user
from app.models import Base
from app.routes import (
    orders,
    providers,
    upload
)
from app.routers import feature_flags, services
from app.features import FeatureFlagMiddleware, feature_manager
# from app.tasks.job_dispatch import start_job_dispatcher
# from app.middleware.metrics import PrometheusMiddleware
# from app.middleware.logging import LoggingMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://services.makrx.store",
        "https://makrx.store",
        "http://localhost:3005",
        "http://localhost:3001",
    ] if not settings.DEBUG else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Feature flag middleware
app.add_middleware(FeatureFlagMiddleware, manager=feature_manager)

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

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers"""
    try:
        # Test database connection
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        
        return {
            "status": "healthy",
            "service": "makrx-services",
            "version": "1.0.0",
            "timestamp": int(time.time())
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

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
@app.post("/api/orders/{order_id}/sync")
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
        access_log=True,
        log_level="info" if settings.DEBUG else "warning"
    )