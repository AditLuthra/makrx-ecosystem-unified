# MakrX Documentation

This directory consolidates documentation migrated from prior repos and apps into the unified monorepo.

## Collections

- AI Docs: `docs/ai/`
- Events Docs: `docs/events/`
- Store (legacy/almost-final): `docs/almost-final/` and `docs/store/`
- Gateway Hacker: `docs/gateway-hacker/`
- MakrCave App: `docs/makrcave/`
- Archive: `docs/archive/` (historical reports and migration notes)

## Quick Links

- Architecture: see `docs/ai/ARCHITECTURE.md` (legacy), plus root `README.md` Architecture Overview
- Deployment: `docs/ai/DEPLOYMENT.md`, `docs/almost-final/SERVER_MAINTENANCE_GUIDE.md`, `DEPLOYMENT_OPTIONS.md`
- Security: `SECURITY.md` (root), `CRITICAL_INFRASTRUCTURE_FIXES.md`, `CRITICAL_FIXES_SUMMARY.md`
- SSO/Keycloak: `docs/ai/SSO_IMPLEMENTATION_SUMMARY.md`, `docs/ai/keycloak-runbook.md`, `docs/ai/idp-runbooks.md`
- GitHub/CI: `docs/ai/GITHUB_INTEGRATION_README.md`, `.github/` workflows

### Store Backend
- Backend Guide: `backends/makrx-store/README.md`
- Service Docs: `docs/store/README.md`
- Makefile tasks: `backends/makrx-store/Makefile`
- CI migration script: `backends/makrx-store/scripts/ci_migrate.sh`

Getting Started (Backend)
- `cd backends/makrx-store`
- `make install`
- `export DATABASE_URL=postgresql://user:pass@localhost:5433/makrx_ecosystem`
- `make db-upgrade`
- `make start-dev`

If a link appears broken, the file may exist under a different collection; browse the folders above.
