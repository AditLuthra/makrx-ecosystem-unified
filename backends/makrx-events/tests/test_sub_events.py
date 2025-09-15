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


def test_create_update_delete_sub_event():
    # Create microsite
    r = client.post("/api/microsites", json={"title": "Site A", "slug": "site-a"})
    assert r.status_code == 201

    # Create sub-event
    payload = {
        "title": "Hackathon Round 1",
        "slug": "hack-round-1",
        "status": "draft",
        "capacity": 100,
    }
    r2 = client.post("/api/microsites/site-a/events", json=payload)
    assert r2.status_code == 201, r2.text
    se = r2.json()
    assert se["slug"] == "hack-round-1"

    # Fetch sub-event
    r3 = client.get("/api/microsites/site-a/events/hack-round-1")
    assert r3.status_code == 200

    # Update sub-event
    r4 = client.patch(
        "/api/microsites/site-a/events/hack-round-1",
        json={"title": "Hackathon R1"},
    )
    assert r4.status_code == 200
    assert r4.json()["title"] == "Hackathon R1"

    # Delete sub-event
    r5 = client.delete("/api/microsites/site-a/events/hack-round-1")
    assert r5.status_code == 200
