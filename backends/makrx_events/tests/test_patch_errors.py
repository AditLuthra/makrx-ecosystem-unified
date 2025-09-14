import os
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///./ci_local.db")

from fastapi.testclient import TestClient
from backends.makrx_events.main import app
from backends.makrx_events.security import CurrentUser, get_current_user


def _fake_user():
    return CurrentUser(user_id="test-user", email="test@example.com", roles=["tester"]) 


def setup_function(_):
    app.dependency_overrides[get_current_user] = _fake_user


def teardown_function(_):
    app.dependency_overrides.clear()


client = TestClient(app)


def test_tournament_patch_not_found_envelope():
    r = client.patch("/api/events/evt-000/tournaments/t-404", json={"status": "ongoing"})
    assert r.status_code == 404
    body = r.json()
    assert body.get("error", {}).get("code") == "NOT_FOUND"
    assert "request_id" in body.get("error", {})


def test_sponsor_patch_not_found_envelope():
    r = client.patch("/api/events/evt-000/sponsors/s-404", json={"status": "inactive"})
    assert r.status_code == 404
    body = r.json()
    assert body.get("error", {}).get("code") == "NOT_FOUND"
    assert "request_id" in body.get("error", {})


def test_slug_validation_rejected_for_microsite():
    r = client.post("/api/microsites", json={"title": "Bad", "slug": "Invalid Slug"})
    assert r.status_code == 422, r.text
    body = r.json()
    assert body.get("error", {}).get("code") == "VALIDATION_ERROR"
    # field path includes body.slug
    assert any("slug" in k for k in body.get("error", {}).get("field_errors", {}).keys())

