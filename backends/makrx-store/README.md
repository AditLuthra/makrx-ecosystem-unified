MakrX Store Backend

Overview
- FastAPI service for the MakrX Store (async SQLAlchemy, secure middleware, Alembic migrations).
- Enhanced catalog, BOM import, bridge to MakrCave, quotes/service orders.

Key Features
- Async SQLAlchemy: unified `database.get_db` with `AsyncSession`.
- Security middleware: HTTPS headers, CORS, CSRF, rate limiting, trusted hosts, API gateway protections.
- Alembic migrations: versioned under `migrations/` with ready‑to‑run revisions.
- Metrics and error reporting: optional Prometheus `/metrics` and Sentry.

Environment Variables
- Core:
  - `DATABASE_URL` (sync driver for Alembic), e.g. `postgresql://user:pass@localhost:5433/makrx_ecosystem`
  - `ENVIRONMENT` = `development` | `staging` | `production`
  - `REDIS_URL` e.g. `redis://localhost:6379/0`
- Auth (Keycloak):
  - `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`
- MakrCave bridge:
  - `MAKRCAVE_API_URL` (e.g. `https://api.makrcave.com`)
  - `MAKRCAVE_API_KEY` (API key auth for outbound and inbound callbacks)
  - `SERVICE_JWT` (optional Bearer for bridge calls)
  - `CAVE_WEBHOOK_SECRET` (HMAC SHA‑256 secret for inbound webhooks)
- S3 / Object Storage:
  - Preferred: `S3_BASE_URL` (e.g. `https://s3.example.com/bucket`)
  - Or: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`, `S3_USE_SSL`
- Observability:
  - `SENTRY_DSN` (optional), `SENTRY_TRACES_SAMPLE_RATE` (e.g. `0.1`)

Install & Run (Development)
- `make install`
- `export DATABASE_URL=postgresql://user:pass@localhost:5433/makrx_ecosystem`
- `make db-upgrade`
- `make start-dev` (serves at `:8000`, docs at `/docs`)

- Ensure env vars above are set; especially `ENVIRONMENT=production`, `REDIS_URL`, and MakrCave/S3 settings.
- `make start-prod` (gunicorn + uvicorn worker, serves at `:8000`)

Database Requirements
- PostgreSQL 13+ is required. Schema and migrations use PostgreSQL-specific features (JSONB, GIN indexes, `ALTER TABLE ... IF NOT EXISTS`).
- Configure DB pool sizing via `DB_POOL_SIZE`, `DB_MAX_OVERFLOW`, `DB_POOL_TIMEOUT`, `DB_POOL_RECYCLE`.

Redis Requirement (Prod)
- `REDIS_URL` is required in production for rate limiting and CSRF/session protections.
- If `REDIS_URL` is missing in production, critical endpoints (uploads, quotes, checkout, login, webhooks) will fail closed with HTTP 503 to protect the service.

Migrations (Alembic)
- Config: `alembic.ini`; scripts: `migrations/`
- Upgrade: `make db-upgrade`
- Autogenerate new revision: `make db-revision m="message"`
- Downgrade one: `make db-downgrade`
- CI helper: `scripts/ci_migrate.sh` (requires `DATABASE_URL`)

Makefile Targets
- `make install` → create venv and install deps
- `make db-upgrade` / `db-revision m="message"` / `db-downgrade`
- `make start-dev` / `start-prod`
- `make migrate-ci` → for CI pipelines

Metrics and Sentry
- Metrics: `/metrics` (Prometheus) if `prometheus-fastapi-instrumentator` is installed (added in requirements).
- Sentry: initialized if `SENTRY_DSN` is present; optional tracing via `SENTRY_TRACES_SAMPLE_RATE`.

Security Middleware
- Enabled via `setup_api_security(app)` in `main.py`:
  - Strict security headers (HSTS, X‑Frame‑Options, CSP), rate limiting, CSRF (double submit), trusted hosts, gateway filtering, and CORS.

MakrCave Bridge & Webhooks
- Outbound:
  - Bridge publishes jobs to `MAKRCAVE_API_URL` with `Authorization: Bearer ${SERVICE_JWT}` if set.
  - Optional `X-API-Key: ${MAKRCAVE_API_KEY}` is supported by `routes/bridge.py`.
- Inbound callbacks (Cave → Store):
  - Endpoint: `POST /api/bridge/jobs/{job_id}/status`
  - Verification (any one):
    - `X-API-Key: ${MAKRCAVE_API_KEY}`
    - Or `X-Signature: sha256=<hex>` where `<hex>` = HMAC_SHA256(raw_body, `CAVE_WEBHOOK_SECRET`).
  - Production requires one of the above; dev allows missing for ease.

Seed & Smoke Test
- Seed sample data: `python3 seed_data.py`
- Enhanced Catalog:
  - GET `/api/enhanced-catalog/catalog/brands?include_products=true`
  - GET `/api/enhanced-catalog/catalog/collections`
  - GET `/api/enhanced-catalog/catalog/tags/popular?limit=10`
  - GET `/api/enhanced-catalog/catalog/categories/tree?include_product_counts=true`
- BOM Import Flow:
  - POST `/api/bom-import/import` → auto‑map + add to cart
  - POST `/api/bom-import/manual-mapping` for unresolved items
- Quotes & Service Orders:
  - POST `/api/complete_flows/quote` → create quote
  - POST `/api/complete_flows/service-orders/from-quote` → create service order
  - POST `/api/complete_flows/service-orders/{id}/publish-to-cave` → publish to Cave (usually via payment webhook)

Troubleshooting
- Migrations: ensure `DATABASE_URL` uses sync driver (`postgresql://...`) for Alembic.
- Redis missing: rate limiting/CSRF/logging still work, but limits fail open; set `REDIS_URL` in prod.
- Webhook 403 in prod: verify either `MAKRCAVE_API_KEY` or `CAVE_WEBHOOK_SECRET` is set and headers are present.
