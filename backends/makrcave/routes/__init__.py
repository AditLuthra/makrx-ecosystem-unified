"""MakrCave API Router - Unified Ecosystem Version"""

from fastapi import APIRouter, Depends
from ..dependencies import get_current_user, require_roles, require_scope

api_router = APIRouter()

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "makrcave-backend"}

# --- Core Routes ---
from .member import router as member_router
api_router.include_router(
    member_router,
    prefix="/members",
    tags=["members"],
    dependencies=[Depends(get_current_user)],
)

from .inventory import router as inventory_router
api_router.include_router(
    inventory_router,
    prefix="/inventory", 
    tags=["inventory"],
    dependencies=[Depends(get_current_user), Depends(require_scope("makerspace"))],
)

from .equipment import router as equipment_router
api_router.include_router(
    equipment_router,
    prefix="/equipment",
    tags=["equipment"],
    dependencies=[Depends(get_current_user), Depends(require_scope("makerspace"))],
)

from .project import router as project_router
api_router.include_router(
    project_router,
    prefix="/projects",
    tags=["projects"],
    dependencies=[Depends(get_current_user)],
)

# Equipment reservations routes
from .equipment_reservations import router as reservations_router
api_router.include_router(
    reservations_router,
    prefix="",
    tags=["reservations"],
    dependencies=[Depends(get_current_user)],
)

from .notifications import router as notifications_router
api_router.include_router(
    notifications_router,
    prefix="/notifications",
    tags=["notifications"],
    dependencies=[Depends(get_current_user)],
)

# --- Admin Routes ---
from .analytics import router as analytics_router
api_router.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["analytics"],
    dependencies=[Depends(get_current_user), Depends(require_roles(["admin", "makerspace_admin"]))],
)

from .billing import router as billing_router
api_router.include_router(
    billing_router,
    prefix="/billing",
    tags=["billing"],
    dependencies=[Depends(get_current_user), Depends(require_roles(["admin", "makerspace_admin"]))],
)

# Makerspace Settings (admin-only)
from .makerspace_settings import router as makerspace_settings_router
api_router.include_router(
    makerspace_settings_router,
    prefix="",
    tags=["makerspace-settings"],
    dependencies=[Depends(get_current_user), Depends(require_roles(["admin", "makerspace_admin"]))],
)
