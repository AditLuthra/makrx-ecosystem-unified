from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import os
import httpx
import time
from typing import Optional, List

security = HTTPBearer()

KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://localhost:8081")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "makrx")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "makrx-events-api")
KEYCLOAK_VERIFY_AUD = os.getenv("KEYCLOAK_VERIFY_AUD", "true").lower() == "true"
KEYCLOAK_ISSUER = os.getenv(
    "KEYCLOAK_ISSUER", f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}"
)
KEYCLOAK_PK_TTL_SECONDS = int(os.getenv("KEYCLOAK_PK_TTL_SECONDS", "3600"))
KEYCLOAK_USE_JWKS = os.getenv("KEYCLOAK_USE_JWKS", "true").lower() in (
    "1",
    "true",
    "yes",
)

_jwks_cache = {}
_jwks_ts = 0.0


def _pem_from_x5c(x5c_entry: str) -> str:
    return f"-----BEGIN CERTIFICATE-----\n{x5c_entry}\n-----END CERTIFICATE-----"


async def get_jwks_pem(kid: str) -> Optional[str]:
    global _jwks_cache, _jwks_ts
    now = time.time()
    if (
        _jwks_cache
        and (now - _jwks_ts) < KEYCLOAK_PK_TTL_SECONDS
        and kid in _jwks_cache
    ):
        return _jwks_cache.get(kid)
    url = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs"
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
        return _jwks_cache.get(kid)


class CurrentUser(dict):
    def __init__(self, user_id: str, email: Optional[str], roles: List[str]):
        super().__init__(user_id=user_id, email=email, roles=roles)

    def __getattr__(self, item):
        if item == "id":
            return self.get("user_id")
        return self.get(item)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> CurrentUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        header = jwt.get_unverified_header(token)
        key_to_use = None
        if KEYCLOAK_USE_JWKS:
            kid = header.get("kid")
            if kid:
                key_to_use = await get_jwks_pem(kid)
        if not key_to_use:
            # fallback to realm public key
            realm_info_url = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}"
            async with httpx.AsyncClient(timeout=5) as client:
                r = await client.get(realm_info_url)
                r.raise_for_status()
                public_key = r.json().get("public_key")
                key_to_use = f"-----BEGIN PUBLIC KEY-----\n{public_key}\n-----END PUBLIC KEY-----"

        decode_kwargs = {"algorithms": ["RS256"], "issuer": KEYCLOAK_ISSUER}
        if KEYCLOAK_VERIFY_AUD:
            decode_kwargs["audience"] = KEYCLOAK_CLIENT_ID
        payload = jwt.decode(token, key_to_use, **decode_kwargs)
        user_id = payload.get("sub")
        email = payload.get("email")
        # roles: realm + client roles
        roles = list(payload.get("realm_access", {}).get("roles", []))
        client_roles = (
            payload.get("resource_access", {})
            .get(KEYCLOAK_CLIENT_ID, {})
            .get("roles", [])
        )
        roles += client_roles
        if not user_id:
            raise credentials_exception
        return CurrentUser(user_id=user_id, email=email, roles=roles)
    except JWTError:
        raise credentials_exception
