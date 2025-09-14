"""
MakrX Store Backend - FastAPI Application
Migrated to MakrX Unified Ecosystem with Keycloak Integration
"""

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
import time
import uuid
import logging
import structlog
import os
from typing import Dict, Any

# Import routes
from routes import (
    health,
    catalog,
    cart,
    orders,
    admin,
    auth,
    uploads,
    quotes,
    enhanced_catalog,
    webhooks,
    bom_import,
    feature_flags,
    service_orders,
    notifications,
)
from database_sync import create_tables, test_connection
from middleware.api_security import setup_api_security
from core.config import settings

# Config: single source of truth via core.config.settings


# Configure structlog for structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="MakrX Store API",
    description="E-commerce platform for MakrX ecosystem",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Security middleware: industry-grade request hardening
setup_api_security(app)

# Optional: Metrics exporter (Prometheus) and Sentry (if available)
try:
    from prometheus_fastapi_instrumentator import Instrumentator

    Instrumentator().instrument(app).expose(app, include_in_schema=False)
    logger.info("Metrics instrumented at /metrics")
except Exception as e:
    logger.info(f"Metrics not enabled: {e}")

try:
    import sentry_sdk

    dsn = os.getenv("SENTRY_DSN")
    if dsn:
        sentry_sdk.init(
            dsn=dsn,
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
            environment=settings.ENVIRONMENT,
        )
        logger.info("Sentry initialized")
except Exception as e:
    logger.info(f"Sentry not enabled: {e}")

# Protect /metrics in production with optional token
if settings.ENVIRONMENT == "production" and os.getenv("METRICS_TOKEN"):
    METRICS_TOKEN = os.getenv("METRICS_TOKEN")

    @app.middleware("http")
    async def metrics_protection_middleware(request: Request, call_next):
        if request.url.path == "/metrics":
            token = request.headers.get("X-Metrics-Token")
            if token != METRICS_TOKEN:
                return JSONResponse(status_code=403, content={"detail": "Forbidden"})
        return await call_next(request)


# CORS is configured by security middleware (setup_api_security)


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


# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(catalog.router, tags=["Catalog"])
app.include_router(cart.router, tags=["Cart"])
app.include_router(orders.router, tags=["Orders"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["Uploads"])
app.include_router(quotes.router, prefix="/api/quotes", tags=["Quotes"])
app.include_router(
    enhanced_catalog.router,
    prefix="/api/enhanced-catalog",
    tags=["Enhanced Catalog"],
)
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(bom_import.router, prefix="/api/bom-import", tags=["BOM Import"])
app.include_router(
    feature_flags.router, prefix="/api/feature-flags", tags=["Feature Flags"]
)
app.include_router(
    service_orders.router,
    prefix="/api/service-orders",
    tags=["Service Orders"],
)
app.include_router(notifications.router, prefix="/api", tags=["Notifications"])


@app.on_event("startup")
async def startup_event():
    """Initialize database and other startup tasks"""
    logger.info("Starting MakrX Store API...", event="startup")
    try:
        if os.getenv("ENVIRONMENT", "development") != "production":
            create_tables()
            test_connection()
            logger.info("Database tables created/verified (dev mode)", event="db_init")
        else:
            logger.info(
                "Production mode: skipping auto table creation; use Alembic migrations",
                event="db_init",
            )
        logger.info("MakrX Store API started successfully", event="startup_complete")
    except Exception as e:
        logger.error("Failed to start API", error=str(e), event="startup_error")
        raise


# Health endpoints are provided by routes.health router


# Sample data initialization endpoint (for development)
@app.post("/api/admin/init-sample-data")
async def init_sample_data():
    """Initialize sample data for development"""
    # This would populate the database with sample categories and products
    return {
        "message": "Sample data initialization would happen here",
        "success": True,
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True, log_level="info")
