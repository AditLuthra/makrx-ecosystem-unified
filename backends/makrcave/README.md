# MakrCave Backend (Unified)

FastAPI backend for MakrCave, integrated into the MakrX unified monorepo with Keycloak SSO and shared infra.

- Auth: Keycloak (realm `makrx`), JWT validation in `dependencies.py`
- Entrypoints: `main.py` (full), `main_simple.py` (simplified, Python <=3.12), `main_simple_py313.py` (Python 3.13-friendly)
  - Use `main.py` in containers and most dev runs. The "simple" variants are lightweight app shells useful for quick smoke tests without wiring all middleware/deps. Keep only one running at a time.
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

Roles and clients:

- Realm roles expected by admin-gated endpoints: `admin`, `makerspace_admin`, `super_admin`.
- Backend audience: `KEYCLOAK_CLIENT_ID=makrcave-api` (ensure tokens contain `aud=makrcave-api`).
- Frontend default client ID is aligned to `makrcave-api`; set `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` if your client differs.

Importing realm config (optional):

- Dev: `services/keycloak/realm-config/makrx-realm.json`
- Staging: `services/keycloak/realm-config/makrx-staging-realm.json`
- Prod: `services/keycloak/realm-config/makrx-prod-realm.json`
  Use Keycloak Admin Console → Realm Settings → Import, or `kcadm.sh` in automation.

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
export DATABASE_URL=postgresql://makrx:makrx_dev_password@localhost:5432/makrx_ecosystem

# From repo root
alembic -c backends/makrcave/alembic.ini revision --autogenerate -m "canonical initial schema"
alembic -c backends/makrcave/alembic.ini upgrade head
```

## Testing

Use a virtual environment and run the MakrCave tests:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backends/makrcave/requirements.txt
pip install -r backends/makrcave/requirements-dev.txt
python -m pytest -q backends/makrcave/tests
```

Notes:

- Tests default to sqlite (DATABASE_URL=sqlite:///./test.db) and set ENVIRONMENT=test.
- Protected routes are exercised using dependency overrides; no Keycloak needed.

Notes:

- After consolidating models, legacy `backends/makrcave/models/member.py` was removed in favor of `enhanced_member.py`.
- `migrations/env.py` enables `compare_type` and `compare_server_default` for more accurate diffs.
- After establishing a full baseline, reconcile any legacy “create\__” helper calls in `migrations/versions/_` that overlap with the canonical schema (keep as no-ops or remove).

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
export DATABASE_URL=postgresql://makrx:makrx_dev_password@localhost:5432/makrx_ecosystem
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
