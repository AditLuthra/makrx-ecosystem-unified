"""
Health check endpoints for makrcave backend
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
import redis
import os
from datetime import datetime

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
@router.get("/ready")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "makrcave",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }


@router.get("/readyz")
async def readiness_check(db: Session = Depends(get_db)):
    """Readiness probe: DB connectivity and Keycloak realm metadata availability."""
    from ..dependencies import get_keycloak_public_key

    status_report = {"status": "ready", "checks": {}}
    # DB check
    try:
        db.execute("SELECT 1")
        status_report["checks"]["database"] = "ok"
    except Exception as e:
        status_report["checks"]["database"] = f"fail: {e}"
        status_report["status"] = "fail"
    # Keycloak metadata check
    try:
        _ = await get_keycloak_public_key(force=False)
        status_report["checks"]["keycloak"] = "ok"
    except Exception as e:
        status_report["checks"]["keycloak"] = f"fail: {e}"
        status_report["status"] = "fail"
    if status_report["status"] != "ready":
        raise HTTPException(status_code=503, detail=status_report)
    return status_report


@router.get("/live")
async def liveness_check():
    """Kubernetes liveness probe"""
    return {
        "status": "alive",
        "service": "makrcave",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """Detailed health check with dependencies"""
    health_status = {
        "status": "healthy",
        "service": "makrcave",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {},
    }

    # Check database
    try:
        db.execute("SELECT 1")
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["checks"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    # Check Redis
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6380/0")
        r = redis.from_url(redis_url)
        r.ping()
        health_status["checks"]["redis"] = "healthy"
    except Exception as e:
        health_status["checks"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    # Check Keycloak
    try:
        keycloak_url = os.getenv("KEYCLOAK_URL", "http://localhost:8081")
        import httpx

        response = httpx.get(f"{keycloak_url}/health/ready", timeout=5)
        if response.status_code == 200:
            health_status["checks"]["keycloak"] = "healthy"
        else:
            health_status["checks"][
                "keycloak"
            ] = f"unhealthy: status {response.status_code}"
            health_status["status"] = "unhealthy"
    except Exception as e:
        health_status["checks"]["keycloak"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    if health_status["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=health_status)

    return health_status
