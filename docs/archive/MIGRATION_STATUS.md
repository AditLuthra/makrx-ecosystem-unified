# Migration Status Summary

This document tracks the unification of prior apps into `makrx-ecosystem-unified`.

## Scope

- Move and reconcile apps, backends, services, rules, and documentation
- Ensure imports resolve via consistent aliases
- Handle component duplication across apps without regressions

## Completed

- Unified Monorepo Structure: `apps/`, `backends/`, `packages/`, `services/`
- Apps present:
  - `apps/gateway-frontend`
  - `apps/gateway-frontend-hacker`
  - `apps/makrcave`
  - `apps/makrx-events`
  - `apps/makrx-store`
- Backends present:
  - `backends/makrcave` (FastAPI)
  - `backends/makrx_events` (FastAPI)
  - `backends/makrx-store` (FastAPI)
- Services present: `services/keycloak`, `services/postgres`, `services/nginx`
- Path Aliases standardized via `tsconfig.base.json` and per-app `tsconfig.json`:
  - `@/*`, `@makrx/auth`, `@makrx/shared-ui`, `@makrx/types`
- Documentation consolidated under `docs/`:
  - `docs/ai/`, `docs/events/`, `docs/almost-final/`, `docs/gateway-hacker/`, `docs/makrcave/`
  - Index at `docs/README.md`
- Duplicate components report generated:
  - `MIGRATION_DUPLICATES_REPORT.md`
  - Strategy: keep per-app copies to avoid breakage now; evaluate consolidation later

## Pending / To Review

- Complete shared DB schema in `packages/shared/src/schema.ts` to cover all imports from `@shared/schema` (microsites, subEvents, eventTemplates, more columns on users, etc.)
- Add missing runtime deps for Events app: `qrcode`, `ws`, `@upstash/ratelimit`, `@upstash/redis` (declared); verify install and usage
- Review and fix Zod error handling (`.issues` vs `.errors`) in Events API routes
- Prettier/ESLint parity per app (root has ESLint; ensure no app-specific conflicting rules if introduced later)
- Optional consolidation of truly shared UI into `packages/shared-ui` based on duplicates report
- Ensure CI/test coverage references updated paths (see `.github/` and `scripts/`)
- Cross-check environment variable docs vs `.env.example`

### MakrX Store Backend (FastAPI)
- Dependencies aligned and venv import verified (`main.app` imports OK)
- Fixed legacy `app.*` imports to local modules
- Requirements updated (asyncpg/boto3/stripe/razorpay/Pillow/etc.)
- Pydantic v2 migration for settings and key schemas (commerce, feature flags)
- SQLAlchemy model fixes (rename reserved `metadata` fields to `meta` attributes)
- Storage client made lazy and dev‑friendly (no creds required at import)
- Health checks updated to use `AsyncSession`
- Startup DB sync now imports models before `create_all`
- Deferred: `routes/service_orders` not included pending model alignment with orders schema (expects JSON `metadata` on order items, additional fields). Enable once models are reconciled.

## Notes

- Root README updated to link to the docs index.
- No destructive changes made to app-local components; imports remain stable.
