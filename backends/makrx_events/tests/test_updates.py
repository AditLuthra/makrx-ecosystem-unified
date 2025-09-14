import os

os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///./ci_local.db")

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


def test_event_team_sponsor_tournament_updates():
    # Create event
    r = client.post("/api/events", json={"title": "My First Event"})
    assert r.status_code == 201, r.text
    ev = r.json()
    event_id = ev["id"]

    # Patch event title and status
    r2 = client.patch(
        f"/api/events/{event_id}",
        json={"title": "Renamed Event", "status": "published"},
    )
    assert r2.status_code == 200, r2.text
    ev2 = r2.json()
    assert ev2["title"] == "Renamed Event"
    assert ev2["status"] == "published"

    # Create team
    r3 = client.post(f"/api/events/{event_id}/teams", json={"name": "Alpha"})
    assert r3.status_code == 201, r3.text
    team = r3.json()

    # Patch team name
    r4 = client.patch(
        f"/api/events/{event_id}/teams/{team['id']}",
        json={"name": "Alpha Prime"},
    )
    assert r4.status_code == 200, r4.text
    team2 = r4.json()
    assert team2["name"] == "Alpha Prime"

    # Create sponsor
    r5 = client.post(
        f"/api/events/{event_id}/sponsors",
        json={"event_id": event_id, "name": "ACME"},
    )
    assert r5.status_code == 201, r5.text
    sponsor = r5.json()

    # Patch sponsor
    r6 = client.patch(
        f"/api/events/{event_id}/sponsors/{sponsor['id']}",
        json={"status": "inactive", "tier": "gold"},
    )
    assert r6.status_code == 200, r6.text
    sp2 = r6.json()
    assert sp2["status"] == "inactive"
    assert sp2.get("tier") == "gold"

    # Create tournament
    r7 = client.post(
        f"/api/events/{event_id}/tournaments", json={"name": "Tourney"}
    )
    assert r7.status_code == 201, r7.text
    t = r7.json()

    # Patch tournament
    r8 = client.patch(
        f"/api/events/{event_id}/tournaments/{t['id']}",
        json={"status": "ongoing", "currentRound": 2},
    )
    assert r8.status_code == 200, r8.text
    t2 = r8.json()
    assert t2["status"] == "ongoing"
    assert t2["currentRound"] == 2
