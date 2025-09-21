import os
import pytest
from fastapi.testclient import TestClient
from backends.makrcave.main import app

client = TestClient(app)

# --- JWT/Keycloak Security Tests ---
def test_protected_endpoint_with_invalid_jwt():
    # Simulate a protected endpoint with a forged/invalid JWT
    headers = {"Authorization": "Bearer invalid.jwt.token"}
    r = client.get("/api/v1/notifications", headers=headers)
    assert r.status_code in (401, 403)


def test_protected_endpoint_with_missing_jwt():
    # No Authorization header
    r = client.get("/api/v1/notifications")
    assert r.status_code in (401, 403)


def test_protected_endpoint_with_expired_jwt(monkeypatch):
    # Simulate an expired JWT (if the backend checks exp claim)
    expired_token = (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
        "eyJleHAiOjE2MDAwMDAwMDB9."
        "invalidsig"
    )
    headers = {"Authorization": f"Bearer {expired_token}"}

    # Patch Keycloak public key fetch to always return a dummy key
    import backends.makrcave.dependencies as dependencies
    async def fake_get_keycloak_public_key(force=False):
        return "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7\n-----END PUBLIC KEY-----"
    monkeypatch.setattr(dependencies, "get_keycloak_public_key", fake_get_keycloak_public_key)

    r = client.get("/api/v1/notifications", headers=headers)
    assert r.status_code in (401, 403)

# --- Service-to-service key test (if applicable) ---
def test_service_to_service_key_missing():
    # If your API expects a service key header, test missing/invalid
    r = client.get("/api/v1/notifications", headers={"X-Service-Key": "invalid"})
    assert r.status_code in (401, 403, 400)

# Add more tests for other protected endpoints as needed
