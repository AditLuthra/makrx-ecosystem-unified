"""
Authentication API routes
User authentication and session management
"""

from fastapi import APIRouter, Depends, HTTPException

from ..core.security import require_auth, AuthUser

router = APIRouter()


@router.get("/me")
async def get_current_user_info(
    current_user: AuthUser = Depends(require_auth),
):
    """Get current user information"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "name": current_user.name,
        "roles": current_user.roles,
        "email_verified": current_user.email_verified,
    }


@router.post("/logout")
async def logout():
    """Logout endpoint (handled by frontend/Keycloak)"""
    return {"message": "Logout successful"}
