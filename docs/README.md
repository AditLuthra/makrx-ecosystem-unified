# MakrX Documentation Index

This directory consolidates documentation migrated from prior repos and apps into the unified monorepo. Start here to find architecture, deployment, and feature-specific docs.

## Table of contents

- Overview and navigation
  - Repository overview: `docs/REPOSITORY_OVERVIEW.md`
  - Configuration standards: `docs/CONFIGURATION_STANDARDS.md`
  - Root README: `../README.md`
- Architecture
  - Legacy architecture overview: `ai/ARCHITECTURE.md`
  - Agents overview: `ai/AGENTS.md`
- Security
  - Security policy: `../SECURITY.md`
  - Critical security fixes (legacy): `ai/CRITICAL_SECURITY_FIXES.md`
- Authentication and SSO
  - SSO summary: `ai/SSO_IMPLEMENTATION_SUMMARY.md`
  - GitHub integration: `ai/GITHUB_INTEGRATION_README.md`
- Deployment & operations
  - Deployment options: `../DEPLOYMENT_OPTIONS.md`
  - Services deployment guide: `../SERVICES_DEPLOYMENT_GUIDE.md`
  - Server maintenance (legacy): `almost-final/SERVER_MAINTENANCE_GUIDE.md`
- Domain collections
  - Events: `events/README.md`
  - MakrCave app: `makrcave/README.md`
  - Store (legacy): `store/README.md` and `almost-final/`
  - Gateway Hacker: `gateway-hacker/VITE_TO_NEXT_MIGRATION.md`

## Notes

- Some documents are legacy snapshots retained for reference (under `almost-final/`). When in doubt, prefer root-level guides and this index.
- Postgres default port is 5432 (see `docker-compose.yml`).
- If a link appears broken, try browsing the folder listed above; names may have changed during consolidation.
