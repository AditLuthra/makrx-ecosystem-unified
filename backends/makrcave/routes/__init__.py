"""MakrCave API Router - Unified Ecosystem Version"""

from fastapi import APIRouter, Depends

from ..dependencies import get_current_user, require_roles, require_scope
from .analytics import router as analytics_router
from .billing import router as billing_router
from .enhanced_bom import router as enhanced_bom_router
from .equipment import router as equipment_router
from .equipment_reservations import router as reservations_router
from .inventory import router as inventory_router
from .machine_access import router as machine_access_router
from .makerspace_settings import router as makerspace_settings_router

# Import all route routers at top-level to satisfy linters
from .member import router as member_router
from .membership_plans import router as membership_plans_router
from .notifications import router as notifications_router
from .project import router as project_router
from .project_showcase import router as project_showcase_router
from .providers import router as providers_router

api_router = APIRouter()


# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "makrcave-backend"}


# --- Core Routes ---
api_router.include_router(
    member_router,
    prefix="/members",
    tags=["members"],
    dependencies=[Depends(get_current_user)],
)

api_router.include_router(
    inventory_router,
    prefix="/inventory",
    tags=["inventory"],
    dependencies=[
        Depends(get_current_user),
        Depends(require_scope("makerspace")),
    ],
)

api_router.include_router(
    equipment_router,
    prefix="/equipment",
    tags=["equipment"],
    dependencies=[
        Depends(get_current_user),
        Depends(require_scope("makerspace")),
    ],
)

api_router.include_router(
    project_router,
    prefix="/projects",
    tags=["projects"],
    dependencies=[Depends(get_current_user)],
)

# Enhanced BOM (relative prefix)
api_router.include_router(
    enhanced_bom_router,
    prefix="",
    tags=["enhanced-bom"],
    dependencies=[Depends(get_current_user)],
)

# Project Showcase (relative prefix)
api_router.include_router(
    project_showcase_router,
    prefix="",
    tags=["project-showcase"],
    dependencies=[Depends(get_current_user)],
)

# Equipment reservations routes
api_router.include_router(
    reservations_router,
    prefix="",
    tags=["reservations"],
    dependencies=[Depends(get_current_user)],
)

# Providers network routes
api_router.include_router(
    providers_router,
    prefix="",
    tags=["providers"],
    dependencies=[Depends(get_current_user)],
)

api_router.include_router(
    notifications_router,
    prefix="/notifications",
    tags=["notifications"],
    dependencies=[Depends(get_current_user)],
)

# --- Admin Routes ---
api_router.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["analytics"],
    dependencies=[
        Depends(get_current_user),
        Depends(require_roles(["admin", "makerspace_admin"])),
    ],
)

api_router.include_router(
    billing_router,
    prefix="/billing",
    tags=["billing"],
    dependencies=[
        Depends(get_current_user),
        Depends(require_roles(["admin", "makerspace_admin"])),
    ],
)

# Makerspace Settings (admin-only)
api_router.include_router(
    makerspace_settings_router,
    prefix="",
    tags=["makerspace-settings"],
    dependencies=[
        Depends(get_current_user),
        Depends(require_roles(["admin", "makerspace_admin"])),
    ],
)

# Membership Plans (admin-only create/update/delete; read requires auth)
# The membership_plans_router already declares prefix="/membership-plans",
# so include it without an extra prefix to avoid double-prefixing.
api_router.include_router(
    membership_plans_router,
    tags=["membership-plans"],
    dependencies=[Depends(get_current_user)],
)

# Machine Access (ensure inclusion under versioned mount)
api_router.include_router(
    machine_access_router,
    prefix="",
    tags=["machine-access"],
    dependencies=[Depends(get_current_user)],
)
