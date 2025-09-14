from fastapi import APIRouter
from fastapi.responses import JSONResponse
import os
import httpx
from sqlalchemy import text
from backends.makrx_events.database import engine

router = APIRouter()


@router.get("/health")
async def health_root():
    return {"status": "healthy", "service": "makrx-events-backend"}



@router.get("/readyz")
async def readyz():
    report = {"status": "ready", "checks": {}}
    # DB check
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        report["checks"]["database"] = "ok"
    except Exception as e:
        report["checks"]["database"] = f"fail: {e}"
        report["status"] = "fail"

    # Keycloak check
    kc_url = os.getenv("KEYCLOAK_URL", "http://localhost:8081")
    realm = os.getenv("KEYCLOAK_REALM", "makrx")
    well_known = f"{kc_url}/realms/{realm}/.well-known/openid-configuration"
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(well_known)
            report["checks"]["keycloak"] = "ok" if r.status_code == 200 else f"fail: status {r.status_code}"
            if r.status_code != 200:
                report["status"] = "fail"
    except Exception as e:
        report["checks"]["keycloak"] = f"fail: {e}"
        report["status"] = "fail"

    if report["status"] == "ready":
        return report
    return JSONResponse(status_code=503, content=report)
