import os

os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///./ci_local.db")

from fastapi.testclient import TestClient
from backends.makrx_events.main import app
from backends.makrx_events.security import CurrentUser, get_current_user


def _fake_user():
    return CurrentUser(user_id="test-user", email="test@example.com", roles=["tester"])


def setup_function(_):
    # Override auth for tests
    app.dependency_overrides[get_current_user] = _fake_user


def teardown_function(_):
    app.dependency_overrides.clear()


client = TestClient(app)


def test_create_microsite_and_uniqueness():
    r = client.post("/api/microsites", json={"title": "My Site", "slug": "my-site"})
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["slug"] == "my-site"

    # Duplicate slug should conflict
    r2 = client.post("/api/microsites", json={"title": "Another", "slug": "my-site"})
    assert r2.status_code == 409, r2.text


def test_get_microsite_and_analytics():
    # Ensure microsite exists
    client.post("/api/microsites", json={"title": "Stats", "slug": "stats"})
    r = client.get("/api/microsites/stats")
    assert r.status_code == 200
    b = r.json()
    assert b["slug"] == "stats"

    # Analytics path should work
    r2 = client.get("/api/microsites/stats/analytics")
    assert r2.status_code == 200
    ab = r2.json()
    assert "overview" in ab
