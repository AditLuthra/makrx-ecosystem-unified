"""
Authentication and dependency injection for MakrCave Backend - Unified Ecosystem
Integrates with Keycloak SSO system
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import httpx
import time
from functools import wraps

from .database import get_db
from models.enhanced_member import Member

security = HTTPBearer()

# Keycloak configuration
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://localhost:8081")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "makrx")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "makrcave-api")

KEYCLOAK_VERIFY_AUD = (
    os.getenv("KEYCLOAK_VERIFY_AUD", "true").lower() == "true"
)
KEYCLOAK_ISSUER = os.getenv(
    "KEYCLOAK_ISSUER", f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}"
)
KEYCLOAK_PK_TTL_SECONDS = int(os.getenv("KEYCLOAK_PK_TTL_SECONDS", "3600"))
KEYCLOAK_USE_JWKS = os.getenv("KEYCLOAK_USE_JWKS", "true").lower() in (
    "1",
    "true",
    "yes",
)

# Cache for Keycloak public key with TTL
_keycloak_public_key = None
_keycloak_public_key_ts = 0.0
_jwks_cache = {}
_jwks_ts = 0.0


def _pem_from_x5c(x5c_entry: str) -> str:
    return (
        f"-----BEGIN CERTIFICATE-----\n{x5c_entry}\n-----END CERTIFICATE-----"
    )


async def get_jwks_pem(kid: str) -> Optional[str]:
    global _jwks_cache, _jwks_ts
    now = time.time()
    if (
        _jwks_cache
        and (now - _jwks_ts) < KEYCLOAK_PK_TTL_SECONDS
        and kid in _jwks_cache
    ):
        return _jwks_cache.get(kid)
    url = (
        f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs"
    )
    tries = 3
    for _ in range(tries):
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()
                new_cache = {}
                for k in data.get("keys", []):
                    this_kid = k.get("kid")
                    x5c = k.get("x5c")
                    if this_kid and x5c:
                        new_cache[this_kid] = _pem_from_x5c(x5c[0])
                if new_cache:
                    _jwks_cache = new_cache
                    _jwks_ts = now
                return _jwks_cache.get(kid)
        except Exception:
            await _async_sleep(0.2)
            continue
    # fall back to previously cached key if present
    return _jwks_cache.get(kid)


async def get_keycloak_public_key(force: bool = False):
    """Get Keycloak public key for JWT verification"""
    global _keycloak_public_key, _keycloak_public_key_ts
    now = time.time()
    if (
        (not force)
        and _keycloak_public_key
        and (now - _keycloak_public_key_ts) < KEYCLOAK_PK_TTL_SECONDS
    ):
        return _keycloak_public_key
    url = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}"
    tries = 3
    for _ in range(tries):
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(url)
                response.raise_for_status()
                realm_info = response.json()
                _keycloak_public_key = f"-----BEGIN PUBLIC KEY-----\n{realm_info['public_key']}\n-----END PUBLIC KEY-----"
                _keycloak_public_key_ts = now
                return _keycloak_public_key
        except Exception:
            await _async_sleep(0.2)
            continue
    # If we have a cached key, use it despite refresh failure
    if _keycloak_public_key:
        return _keycloak_public_key
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Could not connect to authentication service",
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> "CurrentUser":
    """
    Extract and validate JWT token from Keycloak
    Returns the current authenticated user
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Determine verification key
        token = credentials.credentials
        header = jwt.get_unverified_header(token)
        key_to_use = None
        if KEYCLOAK_USE_JWKS:
            kid = header.get("kid")
            if kid:
                key_to_use = await get_jwks_pem(kid)
        if not key_to_use:
            key_to_use = await get_keycloak_public_key()

        # Decode JWT token
        decode_kwargs = {
            "algorithms": ["RS256"],
            "issuer": KEYCLOAK_ISSUER,
        }
        if KEYCLOAK_VERIFY_AUD:
            decode_kwargs["audience"] = KEYCLOAK_CLIENT_ID
        payload = jwt.decode(token, key_to_use, **decode_kwargs)

        # Extract user information
        keycloak_user_id: str = payload.get("sub")
        email: str = payload.get("email")

        if keycloak_user_id is None or email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Get or create user in database (best-effort; do not block response context)
    db_user = (
        db.query(Member)
        .filter(Member.keycloak_user_id == keycloak_user_id)
        .first()
    )
    if db_user is None:
        try:
            db_user = Member(
                keycloak_user_id=keycloak_user_id,
                email=email,
                first_name=payload.get("given_name", ""),
                last_name=payload.get("family_name", ""),
                makerspace_id=payload.get("makerspace_id", "default"),
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        except Exception:
            # If creation fails due to schema constraints, continue with token context
            db.rollback()
            db_user = None

    # Build a unified user context supporting both attribute and key access
    roles = payload.get("realm_access", {}).get("roles", []) + payload.get(
        "resource_access", {}
    ).get(KEYCLOAK_CLIENT_ID, {}).get("roles", [])
    ctx = CurrentUser(
        user_id=keycloak_user_id,
        email=email,
        first_name=payload.get("given_name"),
        last_name=payload.get("family_name"),
        makerspace_id=(
            db_user.makerspace_id if db_user else payload.get("makerspace_id")
        ),
        roles=roles,
        model=db_user,
    )
    return ctx


def require_roles(allowed_roles: List[str]):
    """
    Dependency factory that checks if user has required roles
    """

    def role_checker(
        credentials: HTTPAuthorizationCredentials = Depends(security),
    ):
        try:
            # Decode token to get roles
            payload = jwt.get_unverified_claims(credentials.credentials)

            # Get roles from token
            realm_roles = payload.get("realm_access", {}).get("roles", [])
            client_roles = (
                payload.get("resource_access", {})
                .get(KEYCLOAK_CLIENT_ID, {})
                .get("roles", [])
            )
            user_roles = realm_roles + client_roles

            # Check if user has any of the required roles
            if not any(role in user_roles for role in allowed_roles):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions",
                )

        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

    return role_checker


def require_scope(required_scope: str):
    """
    Dependency factory that checks if user has required scope
    """

    def scope_checker(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        current_user=Depends(get_current_user),
    ):
        # Implement scope checking logic based on your business rules
        # For now, allowing all authenticated users
        if required_scope == "makerspace":
            # Check if user belongs to a makerspace
            if not current_user.makerspace_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Makerspace access required",
                )
        elif required_scope == "self":
            # User can access their own resources
            pass

        return True

    return scope_checker


# Optional dependencies for performance
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> Optional["CurrentUser"]:
    """
    Get current user but allow None if not authenticated
    """
    if credentials is None:
        return None

    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
    except Exception:
        return None


# Lightweight wrapper to support both attribute and dict-style access
class CurrentUser(dict):
    def __init__(
        self,
        user_id: str,
        email: str,
        first_name: Optional[str],
        last_name: Optional[str],
        makerspace_id: Optional[str],
        roles: List[str],
        model: Optional[Member],
    ):
        super().__init__(
            user_id=user_id,
            email=email,
            first_name=first_name,
            last_name=last_name,
            makerspace_id=makerspace_id,
            roles=roles,
        )
        self._model = model

    def __getattr__(self, item):
        # Map common aliases
        if item == "id" and "user_id" in self:
            return self["user_id"]
        if item in self:
            return self[item]
        # Provide passthrough to underlying model if present
        if self._model is not None and hasattr(self._model, item):
            return getattr(self._model, item)
        raise AttributeError(item)


def get_current_admin_user(current_user=Depends(get_current_user)):
    """Require an admin-capable user (admin/makerspace_admin/super_admin)."""
    roles = set()
    try:
        roles = set(current_user.roles)  # attribute style
    except Exception:
        try:
            roles = set(current_user.get("roles", []))  # dict style
        except Exception:
            roles = set()
    allowed = {"admin", "makerspace_admin", "super_admin"}
    if roles.intersection(allowed):
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin privileges required",
    )


async def _async_sleep(seconds: float):
    try:
        import asyncio

        await asyncio.sleep(seconds)
    except Exception:
        pass
