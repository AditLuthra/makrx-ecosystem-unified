import os

os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///./ci_local.db")

from fastapi import APIRouter
from fastapi.testclient import TestClient

from backends.makrx_events.main import app
from backends.makrx_events.security import CurrentUser, get_current_user


def _fake_user():
    return CurrentUser(
        user_id="test-user", email="test@example.com", roles=["tester"]
    )


def setup_function(_):
    app.dependency_overrides[get_current_user] = _fake_user


def teardown_function(_):
    app.dependency_overrides.clear()


client = TestClient(app)


def test_404_error_envelope_for_missing_microsite():
    r = client.get("/api/microsites/does-not-exist")
    assert r.status_code == 404
    body = r.json()
    assert isinstance(body, dict)
    assert "error" in body
    assert body["error"]["code"] == "NOT_FOUND"
    assert "request_id" in body["error"]


def test_422_error_envelope_for_sub_event_missing_title():
    # Ensure a microsite exists
    r0 = client.post(
        "/api/microsites", json={"title": "SiteV", "slug": "sitev"}
    )
    assert r0.status_code in (200, 201)

    # Missing required title triggers validation 422
    r = client.post("/api/microsites/sitev/events", json={})
    assert r.status_code == 422, r.text
    body = r.json()
    assert body["error"]["code"] == "VALIDATION_ERROR"
    # Pydantic location is body.title
    assert any(
        "title" in k for k in body["error"].get("field_errors", {}).keys()
    )


def test_500_error_envelope_unhandled_exception():
    # Add a temporary test route that raises unhandled exception
    router = APIRouter()

    @router.get("/api/test-error")
    def raise_error():
        raise ValueError("boom")

    app.include_router(router)

    r = client.get("/api/test-error")
    assert r.status_code == 500
    body = r.json()
    assert body["error"]["code"] == "INTERNAL_ERROR"
    assert "request_id" in body["error"]
