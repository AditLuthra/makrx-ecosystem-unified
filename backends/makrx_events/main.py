"""
MakrX Events Backend - FastAPI Application
Migrated to unified ecosystem (Keycloak, Postgres, Alembic)
"""

import os
import sys
import time
import uuid
import types
import logging
import structlog
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .logging_config import configure_logging

from .database import init_db, reset_db
from .routes import health, events, auth
from .routes import (
    teams,
    tournaments,
    sponsors,
    sponsors_global,
    microsites,
    sub_events,
    ws,
)
from .middleware.error_handling import (
    ErrorHandlingMiddleware,
    http_exception_handler,
    validation_exception_handler,
)
from fastapi.exceptions import (
    RequestValidationError,
    HTTPException as FastAPIHTTPException,
)

# Configure structured logging
configure_logging()
logger = logging.getLogger("makrx-events")

app = FastAPI(
    title="MakrX Events API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

try:
    from prometheus_fastapi_instrumentator import Instrumentator  # type: ignore
    from prometheus_fastapi_instrumentator.metrics import latency

    # Define custom buckets for latency in seconds.
    LATENCY_BUCKETS = (0.1, 0.5, 1.0, 2.5, 5.0, 10.0)

    instrumentator = Instrumentator()
    instrumentator.add(latency(buckets=LATENCY_BUCKETS))

    instrumentator.instrument(app).expose(app, include_in_schema=False)
    logger.info("metrics_enabled")
except Exception as e:
    logger.info(f"metrics_not_enabled: {e}")

try:
    import sentry_sdk  # type: ignore

    dsn = os.getenv("SENTRY_DSN")
    if dsn:
        sentry_sdk.init(
            dsn=dsn,
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
            environment=os.getenv("ENVIRONMENT", "development"),
        )
        logger.info("sentry_initialized")
except Exception as e:
    logger.info(f"sentry_not_enabled: {e}")

from .middleware.security import add_security_middleware
from .routes import health as _health_mod

add_security_middleware(app)
app.add_middleware(ErrorHandlingMiddleware)

# Register exception handlers to ensure standardized envelope for handled errors
app.add_exception_handler(FastAPIHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)


@app.middleware("http")
async def request_middleware(request: Request, call_next):
    # Check for incoming correlation ID, or generate a new one
    correlation_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    
    # Make it available to the application state
    request.state.request_id = correlation_id

    # Bind to structlog context for logging
    structlog.contextvars.bind_contextvars(request_id=correlation_id)
    
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    
    # Ensure the correlation ID is in the response headers
    response.headers["X-Request-ID"] = correlation_id
    response.headers["X-Response-Time"] = f"{process_time:.2f}ms"
    
    # Clear context variables for the next request
    structlog.contextvars.clear_contextvars()
    
    return response


# Include routers (versioned and legacy for compatibility)
# Unversioned health for liveness
app.include_router(health.router, tags=["Health"])  # /health, /readyz

# Primary v1 mount
app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(events.router, prefix="/api/v1", tags=["Events"])
app.include_router(teams.router, prefix="/api/v1", tags=["Teams"])
app.include_router(tournaments.router, prefix="/api/v1", tags=["Tournaments"])
app.include_router(sponsors.router, prefix="/api/v1", tags=["Sponsors"])
app.include_router(sponsors_global.router, prefix="/api/v1", tags=["Sponsors"])
app.include_router(microsites.router, prefix="/api/v1", tags=["Microsites"])
app.include_router(sub_events.router, prefix="/api/v1", tags=["Microsites"])
app.include_router(
    health.router, prefix="/api/v1", tags=["Health"]
)  # /api/v1/health, /api/v1/readyz

# Legacy mount at /api for backward compatibility (tests expect /api/health)
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(events.router, prefix="/api", tags=["Events"])
app.include_router(teams.router, prefix="/api", tags=["Teams"])
app.include_router(tournaments.router, prefix="/api", tags=["Tournaments"])
app.include_router(sponsors.router, prefix="/api", tags=["Sponsors"])
app.include_router(sponsors_global.router, prefix="/api", tags=["Sponsors"])
app.include_router(microsites.router, prefix="/api", tags=["Microsites"])
app.include_router(sub_events.router, prefix="/api", tags=["Microsites"])
app.include_router(
    health.router, prefix="/api", tags=["Health"]
)  # /api/health, /api/readyz

# Provide legacy alias for /readyz at both root and /api for tests
from .routes import health as _health_mod
app.add_api_route(
    "/readyz", _health_mod.readyz, methods=["GET"], tags=["Health"]
)  # type: ignore[arg-type]
app.add_api_route(
    "/api/readyz", _health_mod.readyz, methods=["GET"], tags=["Health"]
)  # type: ignore[arg-type]

# WebSocket (no prefix)
app.include_router(ws.router)

# In test environment, ensure tables are created eagerly at import time.
# This avoids timing issues with TestClient startup/lifespan and monkeypatches.
if os.getenv("ENVIRONMENT") == "test":
    try:
        # Ensure a clean database on each test module import to avoid unique collisions
        reset_db()
        logger.info("Database tables ensured (test mode, eager)")
    except Exception as e:
        logger.warning(f"Test table init skipped: {e}")


@app.on_event("startup")
def on_startup():
    if os.getenv("ENVIRONMENT", "development") != "production":
        try:
            init_db()
            logger.info("Database tables ensured (dev mode)")
        except Exception as e:
            logger.warning(f"Table init failed (ok if using Alembic): {e}")


@app.get("/")
def root():
    return {
        "name": "MakrX Events API",
        "status": "running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "5000"))

    # Define Uvicorn logging configuration
    LOGGING_CONFIG = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json_formatter": {
                "()": "structlog.stdlib.ProcessorFormatter",
                "processor": structlog.processors.JSONRenderer(),
            },
            "console_formatter": {
                "()": "structlog.stdlib.ProcessorFormatter",
                "processor": structlog.dev.ConsoleRenderer(),
            },
        },
        "handlers": {
            "default": {
                "class": "logging.StreamHandler",
                "formatter": (
                    "console_formatter"
                    if os.getenv("ENVIRONMENT") == "development"
                    else "json_formatter"
                ),
                "level": "INFO",
            },
            "access": {
                "class": "logging.StreamHandler",
                "formatter": "json_formatter",  # Always JSON for access logs
                "level": "INFO",
            },
        },
        "loggers": {
            "uvicorn": {
                "handlers": ["default"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.error": {"level": "INFO"},
            "uvicorn.access": {
                "handlers": ["access"],
                "level": "INFO",
                "propagate": False,
            },
        },
    }

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_config=LOGGING_CONFIG,  # Pass the logging configuration
    )
