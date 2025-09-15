import os
import types
import asyncio

import httpx
import pytest
from fastapi.testclient import TestClient

from backends.makrx_events.main import app
from backends.makrx_events.routes import health as health_mod


client = TestClient(app)


class _FakeResp:
    def __init__(self, status_code=200):
        self.status_code = status_code


class _FakeAsyncClient:
    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def get(self, url):
        return _FakeResp(200)


@pytest.mark.asyncio
async def test_readyz_db_failure(monkeypatch):
    # Force DB connect() to raise
    class _FailConn:
        def __enter__(self):
            raise RuntimeError("db down")

        def __exit__(self, exc_type, exc, tb):
            return False

    monkeypatch.setattr(health_mod.engine, "connect", lambda: _FailConn())
    # Prevent external HTTP call to Keycloak by faking httpx client
    monkeypatch.setattr(httpx, "AsyncClient", _FakeAsyncClient)

    with TestClient(app) as c:
        r = c.get("/api/readyz")
        assert r.status_code == 503
        body = r.json()
        assert body.get("status") == "fail"
        assert "database" in body.get("checks", {})


@pytest.mark.asyncio
async def test_readyz_ok(monkeypatch):
    # Make DB connect succeed and no-op execute
    class _OkConn:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def execute(self, *_args, **_kwargs):
            return None

    monkeypatch.setattr(health_mod.engine, "connect", lambda: _OkConn())

    # Fake httpx client returning 200
    class _FakeResp200:
        def __init__(self):
            self.status_code = 200

    class _FakeAsyncClientOK:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url):
            return _FakeResp200()

    monkeypatch.setattr(httpx, "AsyncClient", _FakeAsyncClientOK)

    with TestClient(app) as c:
        r = c.get("/api/readyz")
        assert r.status_code == 200
        body = r.json()
        assert body.get("status") == "ready"
        assert body.get("checks", {}).get("database") == "ok"
