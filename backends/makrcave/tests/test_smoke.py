import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("ENVIRONMENT", "test")

from fastapi.testclient import TestClient

from backends.makrcave.database import init_db
from backends.makrcave.dependencies import CurrentUser
from backends.makrcave.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") in ("ok", "healthy")


def test_readyz_versioned():
    r = client.get("/api/v1/health/readyz")
    # In test env we may not have DB/Keycloak, allow 200 or 503 with JSON
    assert r.status_code in (200, 503)
    assert r.headers.get("content-type", "").startswith("application/json")


def test_protected_endpoints_require_auth():
    # pick a known protected route
    for path in [
        "/api/v1/inventory",
        "/api/v1/members",
        "/api/v1/notifications",
    ]:
        r = client.get(path)
        assert r.status_code in (401, 403)


def test_happy_path_with_override(monkeypatch):
    # Override dependency to bypass auth for a simple GET route that touches DB lightly
    from backends.makrcave.dependencies import get_current_user

    def _fake_user():
        return CurrentUser(
            user_id="test-user",
            email="u@example.com",
            first_name="T",
            last_name="U",
            makerspace_id="test-makerspace",
            roles=["admin"],
            model=None,
        )

    app.dependency_overrides[get_current_user] = _fake_user

    # Health endpoint
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") in ("healthy", "ready", "alive")

    # Initialize DB schema for simple list calls
    init_db()
    # List endpoints should succeed with auth override (even if empty)
    r = client.get("/api/v1/notifications")
    assert r.status_code in (200, 404, 204)
    r = client.get("/api/v1/members")
    assert r.status_code in (200, 404, 204)


def test_member_create_and_read(client, auth_override, seed_makerspace_and_plan):
    makerspace_id, plan_id = seed_makerspace_and_plan
    payload = {
        "keycloak_user_id": "kc-user-1",
        "email": "user1@example.com",
        "first_name": "User",
        "last_name": "One",
        "membership_plan_id": plan_id,
        "makerspace_id": makerspace_id,
    }
    resp = client.post("/api/v1/members", json=payload)
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data.get("email") == payload["email"]
    member_id = data.get("id")
    # List members
    list_resp = client.get("/api/v1/members")
    assert list_resp.status_code == 200
    # Fetch specific member
    get_resp = client.get(f"/api/v1/members/{member_id}")
    assert get_resp.status_code == 200

    app.dependency_overrides = {}


def test_notifications_list_with_override(client, auth_override):
    r = client.get("/api/v1/notifications")
    assert r.status_code in (200, 404, 204)


def test_inventory_list_with_override(client, auth_override, seed_makerspace_and_plan):
    makerspace_id, _ = seed_makerspace_and_plan
    r = client.get(f"/api/v1/inventory?makerspace_id={makerspace_id}")
    assert r.status_code in (200, 404, 204)
