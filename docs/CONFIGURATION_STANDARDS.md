# Configuration Standards for MakrX Ecosystem

This document standardizes environment variables across apps and backends to reduce confusion and runtime issues.

## Frontend (Next.js) public envs

- Canonical API base: NEXT_PUBLIC_API_BASE_URL
  - Use this as the default client-side base URL when the app talks to its own backend.
  - Keep legacy alias NEXT_PUBLIC_API_URL as optional fallback only.
- Service-specific URLs (set only if used by the app):
  - NEXT_PUBLIC_SERVICES_API_URL — Base URL for the Services backend API
  - NEXT_PUBLIC_STORE_API_URL — Base URL for the Store backend API
- Realtime/WebSockets (optional, only if used):
  - NEXT_PUBLIC_WS_URL — WebSocket base, e.g., ws://localhost:8000
  - NEXT_PUBLIC_EVENT_SERVICE_URL — Events WS base, e.g., ws://localhost:8004
- Auth (Keycloak):
  - NEXT_PUBLIC_KEYCLOAK_URL, NEXT_PUBLIC_KEYCLOAK_REALM, NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
- Observability (optional):
  - NEXT_PUBLIC_SENTRY_DSN, NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE

Guideline: Prefer canonical vars; maintain legacy NEXT_PUBLIC_API_URL only as a fallback to avoid breaking older code.

## Backend storage env precedence

When a backend needs S3-compatible storage, use this precedence and aliasing:

1. Prefer AWS*/S3* variables if provided:

- AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
- S3_BUCKET, S3_REGION, S3_ENDPOINT (optional for MinIO/compat)

2. Otherwise, accept MINIO\_ variables and map them to AWS/S3 equivalents internally:

- MINIO_ACCESS_KEY → AWS_ACCESS_KEY_ID
- MINIO_SECRET_KEY → AWS_SECRET_ACCESS_KEY
- MINIO_BUCKET → S3_BUCKET
- MINIO_ENDPOINT → S3_ENDPOINT
- MINIO_REGION → S3_REGION

Mirror canonical values into aliases to maximize compatibility with client libraries.

Currently implemented in:

- backends/makrx_store/core/config.py
- backends/makrx-services/app/core/config.py

makrx_events backend: No storage usage at this time, so no storage envs required.

## Nginx upstream naming

- Always use Docker service names as upstream targets (never localhost) to ensure container-to-container networking works across environments.

Optional same-origin paths:

- services.makrx.store exposes `/store-api` which proxies to the Store backend's `/api`. Frontends on the services domain can call the Store API without cross-origin requests. You can override with `NEXT_PUBLIC_STORE_API_URL` if you aren't running behind Nginx in dev.

## Health endpoints

- Frontends: Provide /api/health returning minimal JSON
- Backends: Provide /health or /api/health as configured by each service, and align docker-compose healthchecks accordingly.

## Notes

- Local development vs. Docker: In compose, browser calls should target the reverse-proxied hostnames/ports; avoid hardcoded localhost defaults in code. Prefer envs.
- Keep .env.example files updated with the canonical variables and optional placeholders for integrations actually used by each app.
