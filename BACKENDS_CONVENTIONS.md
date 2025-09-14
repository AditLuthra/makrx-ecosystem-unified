# Backend Conventions (Unified)

A shared set of conventions for all backends in `backends/*`.

- Structure: `main.py`, `database.py`, `dependencies.py`, `models/`, `schemas/`, `crud/`, `routes/`, `middleware/`, `services/`, `security/`, `core/config.py`, `migrations/`.
- Auth: Keycloak SSO (realm `makrx`), JWT (RS256) validation; role/scope helpers in `dependencies.py`.
- API Prefix: Mount routers under `/api` (version subpaths `/api/v1/...` inside feature routers). Keep backward‑compatible aliases when consolidating.
- Imports: Prefer package‑relative imports inside service (e.g., `from ..database import get_db` from within `routes/`).
- CORS: Default to local app ports; allow env override `CORS_ORIGINS` (comma‑separated) per backend.
- Error Handling: Use `middleware/error_handling.py` for structured responses, add a request id, include rate limit middleware.
- Readiness: Provide `/health/live` and `/health/readyz` (and under `/api/v1`) with DB and Keycloak checks; treat `/health` as liveness.
- Config: Service runtime options via `core/config.py` (pydantic settings), plus `.env.example` per backend.
- Security: Put reusable helpers/sanitizers under `security/` (e.g., `security/helpers.py`, `security/input_validation.py`).
- Health: Always expose `/health` and `/api/health` endpoints.

These conventions are applied to MakrCave and should be mirrored in other backends.

## Migrations (Alembic)

- Include Alembic config and versions dir per backend.
- Use `alembic -c <backend>/alembic.ini revision --autogenerate -m "msg"` and `upgrade head`.

## Rate Limiting

- Prefer Redis‑backed limiter with in‑memory fallback. Gate via `REDIS_URL`.
 - If running behind reverse proxies, set `TRUST_PROXY=true` and extract client IP from `X-Forwarded-For`.

## Observability

- Structured logs (e.g., structlog) for app logs. Optionally disable duplicated access logs.
- Optional Prometheus metrics via middleware (e.g., `prometheus_fastapi_instrumentator`).
 - Include `X-Request-ID` on all responses; log this ID in structured logs for correlation.

## Runtime

- Default to uvicorn; allow gunicorn + uvicorn worker for multi‑worker with env toggles.

## Auth (Keycloak)

- Prefer JWKS (`/protocol/openid-connect/certs`) for public key rotation; cache with TTL; select by `kid`.
- Validate issuer; audience verification configurable per service.
