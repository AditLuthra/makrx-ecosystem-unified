import os
import time
import uuid
from contextlib import asynccontextmanager

import structlog
import uvicorn
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .database import engine, reset_db
from .dependencies import get_keycloak_public_key
from .logging_config import configure_logging
from .middleware.error_handling import ErrorHandlingMiddleware

# Import security middleware
from .middleware.security import add_security_middleware
from .redis_utils import check_redis_connection
from .routes import api_router
from .routes.health import router as health_router

# Configure logging early
configure_logging()
log = structlog.get_logger(__name__)


# Create FastAPI app
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: warm caches and verify dependencies
    if os.getenv("ENVIRONMENT") == "test":
        try:
            reset_db()
            log.info("test_db_reset_done")
        except Exception as e:
            log.warning("test_db_reset_failed", error=str(e))
    try:
        await get_keycloak_public_key(force=True)
        log.info("keycloak_public_key_warmed")
    except Exception as e:
        log.warning("keycloak_public_key_warm_failed", error=str(e))
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        log.info("database_connectivity_ok")
    except Exception as e:
        log.error("database_connectivity_failed", error=str(e))
    yield
    # Shutdown: nothing special yet


app = FastAPI(
    title="MakrCave API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Sentry integration
try:
    import sentry_sdk

    dsn = os.getenv("SENTRY_DSN")
    if dsn:
        sentry_sdk.init(
            dsn=dsn,
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
            environment=os.getenv("ENVIRONMENT", "development"),
        )
        log.info("sentry_initialized")
except Exception as e:
    log.info(f"sentry_not_enabled: {e}")

default_allowed_origins = [
    "https://makrx.org",
    "https://makrcave.com",
    "https://makrx.store",
]

# Start with defaults; add localhost origins only in dev
allowed_origins = list(default_allowed_origins)

# Allow override via CORS_ORIGINS (comma-separated)
env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    for o in [o.strip() for o in env_origins.split(",") if o.strip()]:
        if o not in allowed_origins:
            allowed_origins.append(o)

# Add environment-specific origins
if os.getenv("ENVIRONMENT") == "development":
    allowed_origins.extend(
        [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
            "http://localhost:3004",
            "http://localhost:8001",
            "http://localhost:8000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:3002",
            "http://127.0.0.1:8001",
            "http://127.0.0.1:8000",
        ]
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add custom middleware
add_security_middleware(app)
app.add_middleware(ErrorHandlingMiddleware)


# Request middleware with request_id and structlog context enrichment
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


# Optional network safety: trusted hosts and proxy headers
trusted_hosts = os.getenv("TRUSTED_HOSTS")
if trusted_hosts:
    hosts = [h.strip() for h in trusted_hosts.split(",") if h.strip()]
    if hosts:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=hosts)


# Plain root health for infra tools (kept minimal; readiness is under /api/v1)
@app.get("/health", status_code=status.HTTP_200_OK)
async def root_health():
    return {"status": "ok", "service": "makrcave-backend"}


# Back-compat readiness (prefer /api/v1/health/readyz)
@app.get("/healthz", status_code=status.HTTP_200_OK)
async def readiness_check():
    db_ok = False
    redis_ok = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        log.error("Database readiness check failed", error=str(e))

    try:
        redis_ok = await check_redis_connection()
    except Exception as e:
        log.error("Redis readiness check failed", error=str(e))

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


# Startup handled via lifespan above


# Include API routes
app.include_router(api_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")

# Backward-compatibility mounts (deprecated)
app.include_router(api_router, prefix="/api")
app.include_router(health_router, prefix="/api")

# Optional Prometheus metrics
if os.getenv("METRICS_ENABLED", "false").lower() in ("1", "true", "yes"):
    try:
        from prometheus_fastapi_instrumentator import Instrumentator
        from prometheus_fastapi_instrumentator.metrics import latency

        # Define custom buckets for latency in seconds.
        LATENCY_BUCKETS = (0.1, 0.5, 1.0, 2.5, 5.0, 10.0)

        instrumentator = Instrumentator()
        instrumentator.add(latency(buckets=LATENCY_BUCKETS))

        instrumentator.instrument(app).expose(
            app, endpoint="/metrics", include_in_schema=False
        )
        log.info("metrics_enabled", endpoint="/metrics")
    except Exception as e:
        log.warning("metrics_not_enabled_missing_dependency", error=str(e))


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    log.info("starting_makrcave_backend", port=port)

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
            "uvicorn": {"handlers": ["default"], "level": "INFO", "propagate": False},
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
        reload=os.getenv("ENVIRONMENT") == "development",
        log_config=LOGGING_CONFIG,  # Pass the logging configuration
    )
