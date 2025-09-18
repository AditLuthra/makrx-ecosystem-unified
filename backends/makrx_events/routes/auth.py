from fastapi import APIRouter, Depends
from backends.makrx_events.security import get_current_user, CurrentUser

router = APIRouter()


@router.get("/auth/user")
def auth_user(user: CurrentUser = Depends(get_current_user)):
    return {
        "id": user.user_id,
        "email": user.get("email"),
        "roles": user.get("roles", []),
    }
