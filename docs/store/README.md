MakrX Store Service Docs

Overview

- Backend: `backends/makrx-store` (FastAPI, async SQLAlchemy)
- Frontend: `apps/makrx-store` (Next.js)
- Integrations: MakrCave bridge (BOM import, job publish), S3 object storage

Quick Start (Backend)

- `cd backends/makrx-store`
- `make install`
- `export DATABASE_URL=postgresql://user:pass@localhost:5433/makrx_ecosystem`
- `make db-upgrade`
- `make start-dev`

Deploy Notes

- Set `ENVIRONMENT=production`, `REDIS_URL`, MakrCave and S3 settings
- Run migrations in CI: `scripts/ci_migrate.sh`
- Metrics at `/metrics` if enabled; Sentry via `SENTRY_DSN`

MakrCave Bridge

- Outbound: jobs published to `${MAKRCAVE_API_URL}` using `SERVICE_JWT` (Bearer)
- Inbound: job status callbacks verified via `X-API-Key` or `X-Signature` (HMAC with `CAVE_WEBHOOK_SECRET`)

Docs

- See backend README: `backends/makrx-store/README.md` for complete env/config and smoke tests.
