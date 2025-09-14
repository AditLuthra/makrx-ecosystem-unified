from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import structlog
from logging_config import configure_logging
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.proxy_headers import ProxyHeadersMiddleware

# Import security middleware
from middleware.security import add_security_middleware
from middleware.error_handling import ErrorHandlingMiddleware

from routes import api_router
from routes.health import router as health_router
from dependencies import get_keycloak_public_key
from database import engine

# Configure logging early
configure_logging()
log = structlog.get_logger(__name__)

# Create FastAPI application
app = FastAPI(
    title="MakrCave Backend API",
    description="Backend API for MakrCave Inventory Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration - Updated for unified ecosystem
allowed_origins = [
    "https://makrx.org",
    "https://makrcave.com",
    "https://makrx.store",
    "http://localhost:3000",  # gateway-frontend
    "http://localhost:3001",  # gateway-frontend-hacker
    "http://localhost:3002",  # makrcave
    "http://localhost:3003",  # makrx-store
    "http://localhost:3004",  # makrx-events
]

# Allow override via CORS_ORIGINS (comma-separated)
env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    for o in [o.strip() for o in env_origins.split(",") if o.strip()]:
        if o not in allowed_origins:
            allowed_origins.append(o)

# Add environment-specific origins
if os.getenv("ENVIRONMENT") == "development":
    allowed_origins.extend([
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:8000"
    ])

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

# Optional network safety: trusted hosts and proxy headers
trusted_hosts = os.getenv("TRUSTED_HOSTS")
if trusted_hosts:
    hosts = [h.strip() for h in trusted_hosts.split(",") if h.strip()]
    if hosts:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=hosts)

if os.getenv("TRUST_PROXY", "false").lower() in ("1", "true", "yes"):
    app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "makrcave-backend"}

# Startup checks: warm Keycloak JWKS/public key and verify DB connection
@app.on_event("startup")
async def on_startup():
    try:
        await get_keycloak_public_key(force=True)
        log.info("keycloak_public_key_warmed")
    except Exception as e:
        log.warning("keycloak_public_key_warm_failed", error=str(e))
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        log.info("database_connectivity_ok")
    except Exception as e:
        log.error("database_connectivity_failed", error=str(e))

# Include API routes
# Primary versioned mount
app.include_router(api_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")

# Backward-compatibility mounts (deprecated)
app.include_router(api_router, prefix="/api")
app.include_router(health_router, prefix="/api")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    log.info("starting_makrcave_backend", port=port)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development"
    )
# Optional Prometheus metrics
if os.getenv("METRICS_ENABLED", "false").lower() in ("1", "true", "yes"): 
    try:
        from prometheus_fastapi_instrumentator import Instrumentator
        Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
        log.info("metrics_enabled", endpoint="/metrics")
    except Exception as e:
        log.warning("metrics_not_enabled_missing_dependency", error=str(e))
