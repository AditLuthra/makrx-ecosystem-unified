import os
os.environ.setdefault("ENVIRONMENT", "test")

from fastapi.testclient import TestClient
from backends.makrx_events.main import app


client = TestClient(app)


def test_health_endpoints():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "healthy"

    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json().get("status") == "healthy"

