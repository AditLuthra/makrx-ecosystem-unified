from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    resp = client.get("/health/")
    assert resp.status_code == 200
    assert resp.json().get("status") == "healthy"


def test_auth_guard():
    # /api/auth/me requires auth, should 401 if not provided
    resp = client.get("/api/auth/me")
    assert resp.status_code in (401, 403)


def test_db_op():
    # Try a DB op endpoint: quick reorder list (requires auth, should 401/403 or 200)
    resp = client.get("/quick-reorder/list")
    assert resp.status_code in (200, 401, 403)
