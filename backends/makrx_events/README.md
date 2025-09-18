# MakrX Events Backend (FastAPI + SQLAlchemy)

- Auth: Keycloak (via JWKS) in `security.py`
- DB: Postgres via SQLAlchemy in `database.py`
- Migrations: Alembic (`alembic.ini`, `migrations/`)

## Endpoints

- Health: `/health`, `/api/health`
- Readiness: `/api/readyz` (checks DB + Keycloak OIDC discovery)
- Auth routes: `/api/auth/user`
- Events: `/api/events` (GET, POST), `/api/events/{id}` (GET)
- Registrations: `/api/events/{id}/register` (POST), `/api/my-events`, `/api/my-registrations`

## Setup (local)

1. `cp .env.example .env`
2. Ensure Postgres and Keycloak are running (via repo `docker-compose.yml`)
3. Run with `uvicorn main:app --reload --port 5000`

## Docker

Built by top-level `docker-compose.yml` as `makrx-events-backend` using `backends/makrx_events/Dockerfile`.

## Config

- `DATABASE_URL`, `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_ISSUER`, `KEYCLOAK_VERIFY_AUD`
- `ENVIRONMENT=production` to disable auto table create; use Alembic in prod
