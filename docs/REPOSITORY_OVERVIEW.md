# MakrX Ecosystem – Repository Overview

This document provides a thorough, single-stop overview of the MakrX unified monorepo: what’s inside, how it’s organized, how to run it locally, how we deploy it, and where to find deeper docs.

Updated: 2025‑09‑20

## Architecture Diagram

```mermaid
graph TB
  subgraph "Frontends (Next.js)"
    GF[Gateway Frontend]
    GHF[Gateway Hacker]
    MC[MakrCave]
    MS[MakrX Store]
    ME[MakrX Events]
  end

  subgraph "Backends (FastAPI)"
    MCB[MakrCave API]
    MEB[Events API]
    MSB[Store API]
  end

  subgraph "Shared Packages"
    AU[@makrx/auth]
    UI[@makrx/shared-ui]
    TY[@makrx/types]
  end

  subgraph "Infrastructure"
    KC[Keycloak]
    PG[(PostgreSQL)]
    RD[(Redis)]
    S3[(MinIO/S3)]
  end

  GF --> KC
  GHF --> KC
  MC --> KC
  MS --> KC
  ME --> KC

  MC --> MCB
  MS --> MSB
  ME --> MEB

  MCB --> PG
  MSB --> PG
  MEB --> PG

  MCB --> RD
  MSB --> RD
  MEB --> RD

  MSB --> S3

  GF --> AU
  GHF --> AU
  MC --> AU
  MS --> AU
  ME --> AU

  GF --> UI
  MC --> UI
  MS --> UI
  ME --> UI
```

## High-Level Purpose

MakrX is a multi-app ecosystem for event management, marketplace commerce, and community engagement. It includes:

- Multiple Next.js frontends (gateway portals, MakrCave, Store, Events)
- Multiple FastAPI backends (MakrCave API, Store API, Events API, Services API)
- Shared TypeScript packages (auth, shared UI, types, feature flags)
- Infrastructure for local dev and production (PostgreSQL, Redis, Keycloak for SSO, MinIO)
- CI/CD, monitoring, and Kubernetes/Docker deployment assets

## Repository Layout

```
apps/                 # Next.js frontends
  gateway-frontend/         (port 3000)
  gateway-frontend-hacker/  (port 3001)
  makrcave/                 (port 3002)
  makrx-store/              (port 3003)
  makrx-events/             (port 3004)

backends/             # FastAPI services
  makrcave/                 (port 8001)
  makrx_events/             (port 8002)
  makrx_store/              (port 8003)
  makrx-services/           (feature flags, service platform)

packages/             # Shared libraries
  auth/                    (Keycloak/Next auth utils)
  shared-ui/               (UI components)
  shared/                  (cross-app helpers)
  types/                   (TypeScript types)
  feature-flags/           (flags client/server helpers)

services/             # Infra configuration
  keycloak/               (realm import files)
  postgres/               (init SQL)
  nginx/                  (reverse proxy configs)

k8s/                  # Base Kubernetes manifests (kustomize)
monitoring/           # Prometheus, Grafana, Loki, Jaeger, exporters
ci/                   # CI helpers
.github/workflows/    # CI/CD pipelines

docs/                 # Documentation index and collections
```

Key top-level files:

- `README.md` – Executive summary + quick start
- `QUICK_START.md`, `INSTALLATION.md` – Setup, local dev
- `BACKENDS_CONVENTIONS.md` – API/service conventions
- `FEATURE_FLAGS_GUIDE.md` – Flags design and usage
- `SECURITY.md` – Security policy and practices
- `docker-compose*.yml` – Dev, staging, prod compose stacks
- `SERVICES_DEPLOYMENT_GUIDE.md` – Services subdomain deployment

## Technology Stack

- Frontend: Next.js 14, React 18, Tailwind, Radix UI
- Backend: FastAPI, SQLAlchemy, Alembic, Pydantic v2
- Auth: Keycloak (OIDC) with centralized realm (`makrx` for dev)
- Data: PostgreSQL 15, Redis 7
- Object storage: MinIO (S3-compatible)
- Observability: Prometheus, Grafana, Loki/Promtail, Jaeger
- CI/CD: GitHub Actions (lint, typecheck, test, docker build, deploy)

## Frontend Applications

- Gateway Frontend (`apps/gateway-frontend`, 3000): main landing and gateway
- Gateway Hacker (`apps/gateway-frontend-hacker`, 3001): developer/alt portal
- MakrCave (`apps/makrcave`, 3002): event/makerspace app
- MakrX Store (`apps/makrx-store`, 3003): e‑commerce
- MakrX Events (`apps/makrx-events`, 3004): events discovery & management

Notes

- All apps use shared packages (e.g., `@makrx/auth`) for Keycloak SSO and fetch helpers.
- NextAuth is provisioned in some apps for session handling; production URLs set via env.

## Backend Services

- MakrCave API (`backends/makrcave`, 8001): core API with structured logging, metrics, Redis, Keycloak JWT validation, Alembic migrations.
- Events API (`backends/makrx_events`, 8002): events domain, health endpoints mounted under both `/api` and `/api/v1`, optional WebSocket.
- Store API (`backends/makrx_store`, 8003): marketplace, S3/MinIO integration, email/SMS gateways ready.
- MakrX Services (`backends/makrx-services`): services platform and feature flags system (see FEATURE_FLAGS_GUIDE.md).

Common conventions (see `BACKENDS_CONVENTIONS.md`)

- Routes mounted under `/api/v1/...` with backward‑compat `/api` aliases where needed
- Liveness (`/health`) and readiness (`/readyz` or `/api/v1/health/readyz`) endpoints
- CORS configured with local app ports; override via `CORS_ORIGINS`
- Rate limiting via Redis when `REDIS_URL` set
- Structured JSON logs (structlog); optional Prometheus metrics at `/metrics`

## Running Locally

Quick path

- Simple dev (no SSO): `npm run dev:simple` (runs convenience script)
- Full stack (SSO + infra + apps + backends): `npm run dev`
- Stop: `npm run stop`

Prerequisites

- Node.js 20+ (CI uses Node 20)
- Python 3.12 for backend venvs (recommended per Installation guide)
- Docker & Docker Compose

Initial setup

1. Install root deps: `npm ci --legacy-peer-deps`
2. Create envs: `cp .env.example .env` and per-app `.env.local` from examples
3. Start infra: `docker-compose up -d postgres redis keycloak minio`
4. Create backend venvs and install requirements (see `INSTALLATION.md` for loop)
5. Run DB migrations: `npm run db:migrate`
6. Start dev: `npm run dev`

Useful scripts (root `package.json`)

- `npm run diagnose` – status and port checks
- `npm run dev:apps` / `npm run dev:backends` / `npm run dev:infrastructure`
- `npm run docker:dev` / `npm run docker:prod`
- `npm run db:migrate` / `npm run db:seed`

Default local ports

- Apps: 3000–3004
- Backends: 8001–8003
- Postgres 5432 (5434 for staging compose), Redis 6380, Keycloak 8081, MinIO 9000/9001

## Environment Variables

Top-level examples (see `.env.example`, per app `.env.example`)

- Database: `DATABASE_URL=postgresql://makrx:password@localhost:5432/makrx_ecosystem`
- Redis: `REDIS_URL=redis://localhost:6380`
- Keycloak: `KEYCLOAK_URL=http://localhost:8081`, `KEYCLOAK_REALM=makrx`
- App URLs: `NEXT_PUBLIC_*` per app
- Inter-service: e.g., `MAKRCAVE_API_URL=http://localhost:8001`

Secret management policy

- Never commit real secrets; keep only `.env.example` in git.

## Deployment

Docker Compose

- Development: `docker-compose up -d postgres redis keycloak minio`
- Staging: `docker-compose -f docker-compose.staging.yml up -d`
- Production: `docker-compose -f docker-compose.prod.yml up -d`

Reverse proxy

- Nginx configs at `services/nginx`; production image `Dockerfile.prod` exposes SSL.
- Certbot service available in prod compose with volumes for auto‑renewal.

Kubernetes

- `k8s/base` contains kustomize base (namespace, secrets/config map skeletons, postgres, redis).
- Extend with overlays for staging/production as needed.

Monitoring

- Staging compose includes Prometheus (exposed at 9091) for basic metrics; see `docker-compose.staging.yml`.
- Additional monitoring (Grafana, Loki/Promtail, Jaeger) can be integrated; see `monitoring/` folder for configs if present.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`)

- Quality: ESLint, Prettier, TS type-check using pnpm
- Security: Trivy file system scan, npm audit
- Tests: unit tests per app; backend pytest matrix with Postgres/Redis services
- Build: per‑app Next.js builds, artifacts upload
- Docker: matrix build/push to GHCR for apps and backends (amd64/arm64)
- E2E: starts docker-compose locally and runs playwright tests
- Deploy: staging on develop, production on main (scripts referenced: `deploy-docker-staging.sh`, `deploy-docker-prod.sh`)

Note: CI uses pnpm; local root `package.json` uses npm. This is intentional for CI speed. Local developers may continue with npm unless otherwise noted.

## Security

- Central SSO via Keycloak, tokens attached via `@makrx/auth` helpers
- Strict CSP and hardened Nginx in production
- Secrets policy: environment files only; rotate if leaked
- Backends: HTTPS at edge, CSRF where applicable, rate limiting with Redis

See `SECURITY.md` for reporting and full policy.

## Feature Flags

- Comprehensive multi-level flags (enabled, disabled, beta, password-only, role-based, A/B)
- Admin dashboard `/admin/feature-flags` (requires admin + permission)
- Backend decorators and frontend gates/hooks to protect features
- Config via JSON under `config/features` and runtime overrides

See `FEATURE_FLAGS_GUIDE.md` for details and examples.

## Conventions & Standards

- Backends follow `BACKENDS_CONVENTIONS.md` for structure, health endpoints, logging, metrics
- Code quality: ESLint, Prettier, TypeScript; Python linters configured via ruff/mypy/pytest
- Commit style: Conventional Commits recommended

## Troubleshooting (Quick)

- Ports busy: check with `lsof -i :PORT`; change env or stop conflicting services
- Keycloak slow to start: wait 1–3 minutes; check `docker-compose logs keycloak`
- Migrations skipped: ensure `DATABASE_URL` is set and backends venvs have deps
- Redis/DB readiness: see `/health` and `/readyz` endpoints on backends

## Pointers & Next Steps

- Docs index: `docs/README.md`
- Per-backend READMEs and Makefiles under each backend folder
- Nginx production configs under `services/nginx`
- K8s base under `k8s/base` with kustomize

Potential improvements

- Add k8s overlays (staging/production) with Ingress, secrets, and app deployments
- Unify package manager choice across local and CI (document rationale)
- Add architecture diagrams under `docs/` generated from source

— End of Overview —
