# Contributing to MakrX

Thanks for helping improve the MakrX ecosystem! This guide covers how we work and what we expect from contributions.

## Scope & Structure

- Review the [architecture overview](ARCHITECTURE.md) for how services fit together.
- Each application maintains its own docs/README where present; key locations:
  - Makrcave Backend: `backends/makrcave/`
  - MakrX Store Backend: `backends/makrx_store/`
  - MakrX Store Frontend: `apps/makrx-store/`
  - Gateway Frontend: `apps/gateway-frontend/`
  - Makrcave Frontend: `apps/makrcave/`

## Experiments

Prototype or archived services belong in [/experimental/](experimental/). Each experiment must live in its own folder and include a README containing:

- Purpose and scope
- Status (prototype, archived, etc.)
- Owner
- Last updated date
- Link to the [promotion checklist](experimental/PROMOTION_CHECKLIST.md)

### Promotion workflow

1. Flesh out tests, documentation, and deployment artifacts.
2. Complete the [promotion checklist](experimental/PROMOTION_CHECKLIST.md).
3. Move the service out of `/experimental` and update [ARCHITECTURE.md](ARCHITECTURE.md).

## Prerequisites

- Node.js 20.x
- Python 3.12
- Docker 20+
- JavaScript package manager: `npm`
- Environment template: `.env.production.template` in repo root (service-specific `.env.example` files live in each app)

| Service              | Node version | Python version | Selection command  |
| -------------------- | ------------ | -------------- | ------------------ |
| Gateway Frontend     | 20           | -              | `nvm use`          |
| Makrcave Frontend    | 20           | -              | `nvm use`          |
| MakrX Store Frontend | 20           | -              | `nvm use`          |
| Makrcave Backend     | -            | 3.12           | `pyenv local 3.12` |
| MakrX Store Backend  | -            | 3.12           | `pyenv local 3.12` |

## Local Development

1. `cp .env.production.template .env`
2. `docker-compose up -d postgres redis keycloak minio`
3. Start a backend (example):
   ```bash
   cd backends/makrcave
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
4. Start a frontend (example):
   ```bash
   cd apps/gateway-frontend
   npm install
   npm run dev
   ```

## Docker Build Contexts

Never include the following in Docker build contexts:

- `node_modules` or other dependency directories
- compiled output such as `dist/` or build caches
- secrets, environment files, or credentials
- large media, test fixtures, or sample datasets

`.dockerignore` files are audited quarterly to keep images lean. For how build contexts are used in automation, see the CI config under `.github/workflows/` and the [Repository Overview](../REPOSITORY_OVERVIEW.md).

## Branching Model

- `feature/<topic>` for new features
- `fix/<bug>` for bug fixes
- `chore/<task>` for tooling or maintenance
- `docs/<change>` for documentation
  Always branch from `main` and keep in sync via `git fetch origin` and `git rebase origin/main` (or merge if preferred).

## Commits & Pull Requests

- Use [Conventional Commits](https://www.conventionalcommits.org/)
- Review the [PR review checklist](docs/PR_REVIEW_CHECKLIST.md) before submitting.
- PR checklist:
  - [ ] Tests updated
  - [ ] OpenAPI specs regenerated
  - [ ] Alembic migrations added and applied
  - [ ] Documentation updated
  - [ ] Update `.dockerignore` when adding heavy folders
  - [ ] CHANGELOG.md updated
  - [ ] Feature flags default to safe values

## Changelog

We maintain a root [`CHANGELOG.md`](CHANGELOG.md) using the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and [Semantic Versioning](https://semver.org/).
Include an entry under the **Unreleased** section for any user-facing change in your pull request. During release tagging, entries are moved to a new version heading.

## Coding Standards

- Use a 4-space indent for all languages.
- **TypeScript/JavaScript**: ESLint + Prettier
- **Python**: Black + flake8

## Testing & Migrations

- Run `npm test` for JS/TS packages
- Run backend test suites (`pytest` where available)
- Apply DB migrations with Alembic: `alembic upgrade head`
- Create new migrations with `alembic revision --autogenerate -m "msg"`

## API Contracts

- Canonical contract lives in backend-specific OpenAPI docs (see each backend README) and the shared [Repository Overview](../REPOSITORY_OVERVIEW.md)
- Each backend exposes `/openapi.json`
- Version APIs using `/api/v{n}` and bump the major version for breaking changes

## Issue Triage & Security

- Triage issues with labels (`bug`, `feature`, `docs`, etc.)
- Report security concerns per [SECURITY.md](../../SECURITY.md)
- Architectural decisions: capture rationale in PR descriptions and reference in docs where applicable

Happy hacking!
