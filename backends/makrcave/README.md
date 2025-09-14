# MakrCave Backend (Unified)

FastAPI backend for MakrCave, integrated into the MakrX unified monorepo with Keycloak SSO and shared infra.

- Auth: Keycloak (realm `makrx`), JWT validation in `dependencies.py`
- Entrypoints: `main.py` (full), `main_simple.py` (simplified), `main_simple_py313.py`
- Routes: see `routes/` (inventory, equipment, projects, analytics, billing, health, etc.)
- Models/CRUD/Schemas: under `models/`, `crud/`, `schemas/`

## Quick Start

- Create env: `cp .env.example .env`
- Install: `pip install -r requirements.txt`
- Run dev: `uvicorn main:app --host 0.0.0.0 --port 8001 --reload`
- Docs: `http://localhost:8001/docs`

## Keycloak Settings

Set env vars:
- `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`
  - Optional: `KEYCLOAK_VERIFY_AUD`, `KEYCLOAK_ISSUER`, `KEYCLOAK_PK_TTL_SECONDS`, `KEYCLOAK_USE_JWKS`
  - JWKS is used by default; token header `kid` selects the correct key; falls back to realm public key

## Migrations (Alembic)

- Config lives in `backends/makrcave/alembic.ini`
- Env file: `backends/makrcave/migrations/env.py`
- Create a new revision from models:
  - `alembic -c backends/makrcave/alembic.ini revision --autogenerate -m "your message"`
- Upgrade DB:
  - `alembic -c backends/makrcave/alembic.ini upgrade head`

### Migration Status

- Baseline revision `0001_initial` is currently a no-op placeholder.
- Revisions `0003`–`0005` create specific feature tables via legacy helpers (skills, project interactions, analytics).
- Core domain tables (e.g., inventory, equipment, members, projects, etc.) should be captured via an auto‑generated revision from current models.

To generate a comprehensive initial schema (canonical baseline):

```bash
# Ensure DATABASE_URL points to an empty/fresh schema
export DATABASE_URL=postgresql://makrx:makrx_dev_password@localhost:5433/makrx_ecosystem

# From repo root
alembic -c backends/makrcave/alembic.ini revision --autogenerate -m "canonical initial schema"
alembic -c backends/makrcave/alembic.ini upgrade head
```

Notes:
- After consolidating models, legacy `backends/makrcave/models/member.py` was removed in favor of `enhanced_member.py`.
- `migrations/env.py` enables `compare_type` and `compare_server_default` for more accurate diffs.
- After establishing a full baseline, reconcile any legacy “create_*” helper calls in `migrations/versions/*` that overlap with the canonical schema (keep as no-ops or remove).

## Rate Limiting (Redis)

- Set `REDIS_URL` to enable distributed rate limiting; falls back to in‑memory.
 - If behind a reverse proxy, set `TRUST_PROXY=true` to use `X-Forwarded-For` for client IP detection.

## Readiness

- Liveness: `/health/live`
- Readiness: `/health/readyz` (checks DB and Keycloak metadata)

## Metrics

- Enable Prometheus metrics by setting `METRICS_ENABLED=true` (requires `prometheus-fastapi-instrumentator`).

## Notes

- Unified security middleware enabled in `main.py`.
- Rate limits and security headers configured in `middleware/security.py`.
- Request logging reads minimal context via `security/helpers.py` (Keycloak JWT claims when available).

For overall architecture and dev flow, see monorepo root `README.md` and `docs/`.

## Seeding (Local Dev)

You can seed a minimal dataset (makerspace, basic plan, admin member), plus a sample inventory item and a default notification template:

```bash
# From repo root
export DATABASE_URL=postgresql://makrx:makrx_dev_password@localhost:5433/makrx_ecosystem
python makrx-ecosystem-unified/backends/makrcave/seed.py

# Or from backend folder
cd makrx-ecosystem-unified/backends/makrcave
python seed.py

# Or via Makefile
make seed
```

The script is idempotent and will not create duplicates on rerun. If your `makerspaces.id` type
doesn't match the `membership_plans.makerspace_id` UUID FK in your environment, the plan seeding
will be skipped with a warning, but makerspace and admin member will still be created.
