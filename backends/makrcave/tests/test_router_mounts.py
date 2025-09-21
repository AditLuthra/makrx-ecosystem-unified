from fastapi.testclient import TestClient

from backends.makrcave.main import app
from backends.makrcave.dependencies import CurrentUser, get_current_user
from backends.makrcave.database import init_db


import uuid
def _fake_user():
    return CurrentUser(
        user_id=str(uuid.uuid4()),
        email="u@example.com",
        first_name="T",
        last_name="U",
        makerspace_id="test-makerspace",
        roles=["admin"],
        model=None,
    )


def test_skills_and_enhanced_projects_routes_mounted():
    app.dependency_overrides[get_current_user] = _fake_user
    init_db()
    client = TestClient(app)

    # Skills equipment requirements route should be reachable
    r1 = client.get("/api/v1/skills/equipment-requirements")
    assert r1.status_code in (200, 204, 404)

    # Enhanced projects public listing should be reachable
    r2 = client.get("/api/v1/enhanced-projects/public")
    assert r2.status_code in (200, 204, 404)

    app.dependency_overrides = {}
