"""
Security and authentication utilities
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
import httpx
from datetime import datetime

from app.core.config import get_settings
from app.core.database import get_db
from app.models.users import User

settings = get_settings()
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token"""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        
        # Verify token with Keycloak
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise credentials_exception
            
            user_info = response.json()
        
        # Get or create user in local database
        user = db.query(User).filter(User.id == user_info["sub"]).first()
        
        if not user:
            user = User(
                id=user_info["sub"],
                email=user_info.get("email", ""),
                first_name=user_info.get("given_name", ""),
                last_name=user_info.get("family_name", ""),
                roles=",".join(user_info.get("realm_access", {}).get("roles", [])),
                last_login=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update last login
            user.last_login = datetime.utcnow()
            db.commit()
        
        return user
        
    except Exception as e:
        raise credentials_exception

def get_user_roles(user: User) -> list:
    """Get user roles as list"""
    if not user.roles:
        return []
    return user.roles.split(",")

def has_role(user: User, role: str) -> bool:
    """Check if user has specific role"""
    return role in get_user_roles(user)

def require_role(role: str):
    """Dependency to require specific role"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if not has_role(current_user, role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role {role} required"
            )
        return current_user
    return role_checker

# Common role dependencies
require_service_provider = require_role("service_provider")
require_admin = require_role("admin")
require_super_admin = require_role("super_admin")