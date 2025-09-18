import os
from functools import lru_cache
from typing import Optional

import httpx

KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://keycloak:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "makrx")
CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "makrcave-api")
CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET", "")


@lru_cache()
def _token_endpoint() -> str:
    return f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token"


async def get_service_token() -> str:
    """Obtain access token using client credentials."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            _token_endpoint(),
            data={
                "grant_type": "client_credentials",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
            },
        )
        resp.raise_for_status()
        return resp.json()["access_token"]


class KeycloakClient:
    """Minimal async client wrapper used by parts of the legacy codebase."""

    def __init__(
        self,
        client_id: str = CLIENT_ID,
        client_secret: str = CLIENT_SECRET,
        base_url: str = KEYCLOAK_URL,
        realm: str = KEYCLOAK_REALM,
    ) -> None:
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = base_url
        self.realm = realm

    @property
    def token_endpoint(self) -> str:
        return f"{self.base_url}/realms/{self.realm}/protocol/openid-connect/token"

    async def get_service_token(self) -> str:
        """Fetch a client-credential token using instance configuration."""

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                self.token_endpoint,
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            token: Optional[str] = data.get("access_token")
            if not token:
                raise RuntimeError("Keycloak did not return an access token")
            return token
