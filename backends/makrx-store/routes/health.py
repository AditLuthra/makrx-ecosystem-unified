"""
Health check endpoints for makrx-store backend
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db
from redis.asyncio import Redis as AsyncRedis
import os
from datetime import datetime
import httpx
from ..redis_utils import check_redis_connection

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
@router.get("/ready")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "makrx-store",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }


@router.get("/live")
async def liveness_check():
    """Kubernetes liveness probe"""
    return {
        "status": "alive",
        "service": "makrx-store",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/healthz")
@router.get("/detailed")
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """Detailed health check with dependencies"""
    health_status = {
        "status": "healthy",
        "service": "makrx-store",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {},
    }

    # Check database
    try:
        await db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["checks"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    # Check Redis (async)
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6380/0")
        r = await AsyncRedis.from_url(redis_url)
        await r.ping()
        await r.close()
        health_status["checks"]["redis"] = "healthy"
    except Exception as e:
        health_status["checks"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    # Check Keycloak
    try:
        keycloak_url = os.getenv("KEYCLOAK_URL", "http://localhost:8081")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{keycloak_url}/health/ready", timeout=5)
            if response.status_code == 200:
                health_status["checks"]["keycloak"] = "healthy"
            else:
                health_status["checks"]["keycloak"] = (
                    f"unhealthy: status {response.status_code}"
                )
                health_status["status"] = "unhealthy"
    except Exception as e:
        health_status["checks"]["keycloak"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    if health_status["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=health_status)

    return health_status
