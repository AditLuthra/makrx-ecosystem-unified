# MakrX Ecosystem Startup Guide

This guide covers all supported ways to start the MakrX Ecosystem in **development**, **simple**, **full**, **production**, **staging**, **CI/test**, and **setup** modes. It includes prerequisites, commands, environment variables, and troubleshooting tips for each mode.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Startup Modes](#startup-modes)
  - [Development Mode](#development-mode)
  - [Simple Mode (No Auth)](#simple-mode-no-auth)
  - [Full Ecosystem Mode](#full-ecosystem-mode)
  - [Production Mode](#production-mode)
  - [Staging Mode](#staging-mode)
  - [CI/Test Mode](#citest-mode)
  - [Setup & All-in-One](#setup--all-in-one)
- [Troubleshooting](#troubleshooting)
- [Access URLs](#access-urls)
- [Support](#support)

---

## Prerequisites

- **Node.js** 20+
- **Python** 3.12+
- **Docker** & Docker Compose
- **npm** 8+
- **Git**

## Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd makrx-ecosystem-unified
   ```
2. **Install dependencies:**
   ```bash
   npm ci --legacy-peer-deps
   ```
3. **Copy and edit environment files:**

   ```bash
   cp .env.example .env
   # Edit .env as needed
   ```

   - For per-app configs, see `apps/*/.env.example` and `backends/*/.env.example`.

---

## Startup Modes

### Development Mode

- **Purpose:** Full-featured local dev with auth, hot reload, all apps/services.
- **Script:** `start-dev.sh` or `npm run dev`
- **Docker Compose:** `docker-compose.yml`
- **How to Start:**
  ```bash
  npm run dev
  # or
  ./scripts/start-dev.sh
  ```
- **What it does:**
  - Starts Postgres, Redis, Keycloak, MinIO via Docker
  - Starts all frontend (Next.js) and backend (FastAPI) apps
  - Hot reload, logs to `logs/`, checks for port conflicts
- **Environment:** `.env`, per-app `.env.local`

### Simple Mode (No Auth)

- **Purpose:** Fastest startup for UI dev, skips advanced auth
- **Script:** `start-simple.sh` or `npm run dev:simple`
- **Docker Compose:** `docker-compose.yml`
- **How to Start:**
  ```bash
  npm run dev:simple
  # or
  ./scripts/start-simple.sh
  ```
- **What it does:**
  - Starts core infrastructure
  - Starts only essential apps
- **Environment:** `.env`, per-app `.env.local`

### Full Ecosystem Mode

- **Purpose:** Local integration, pre-prod testing, all services
- **Script:** `scripts/start-full-ecosystem.sh` or `scripts/start.sh`
- **Docker Compose:** `docker-compose.yml`
- **How to Start:**
  ```bash
  ./scripts/start-full-ecosystem.sh
  # or
  ./scripts/start.sh
  ```
- **What it does:**
  - Runs all infrastructure and apps
  - Waits for health checks, manages logs and PIDs
- **Environment:** `.env`, per-app `.env.local`

### Production Mode

- **Purpose:** Real deployment, secure, persistent, with Nginx, Certbot, etc.
- **Docker Compose:** `docker-compose.prod.yml`
- **How to Start:**
  ```bash
  docker-compose -f docker-compose.prod.yml up -d
  # or
  npm run docker:prod
  ```
- **What it does:**
  - Uses production configs, secrets, persistent volumes
  - Nginx, Certbot, and other production services included
- **Environment:** `.env` (production values), secrets must be set

### Staging Mode

- **Purpose:** Pre-production validation, mirrors prod with staging configs
- **Docker Compose:** `docker-compose.staging.yml`
- **How to Start:**
  ```bash
  docker-compose -f docker-compose.staging.yml up -d
  ```
- **What it does:**
  - Staging configs, ports, and data
- **Environment:** `.env` (staging values)

### CI/Test Mode

- **Purpose:** Automated testing, CI pipelines
- **Script:** `start-for-ci.sh`
- **Docker Compose:** `docker-compose.ci.yml`
- **How to Start:**
  ```bash
  ./scripts/start-for-ci.sh
  # or
  docker-compose -f docker-compose.ci.yml up -d
  ```
- **What it does:**
  - Minimal services for automated testing
- **Environment:** `.env` (test values)

### Setup & All-in-One

- **Purpose:** New contributors, fresh setups
- **Script:** `setup_and_start.sh`
- **How to Start:**
  ```bash
  ./scripts/setup_and_start.sh
  ```
- **What it does:**
  - Checks all prerequisites, installs dependencies, starts infrastructure and apps

---

## Troubleshooting

- **Missing dependencies:**
  ```bash
  npm run fix-deps
  ```
- **Port conflicts:**
  ```bash
  npm run diagnose
  # Kill conflicting processes if needed
  ```
- **Docker issues:**
  ```bash
  docker-compose down
  docker-compose up -d postgres redis keycloak minio
  ```
- **Python not found:**
  ```bash
  which python3
  ```
- **Logs:**
  - Check `logs/` directory for app logs
  - Use `docker-compose logs <service>` for container logs

---

## Access URLs

- http://localhost:3000 - Gateway Frontend
- http://localhost:3001 - Gateway Frontend Hacker
- http://localhost:3002 - MakrCave
- http://localhost:3003 - MakrX Store
- http://localhost:3004 - MakrX Events
- http://localhost:9001 - MinIO Console
- http://localhost:8081 - Keycloak

---

## Support

- Run `npm run diagnose` for system status
- Check terminal logs
- See `README.md`, `QUICK_START.md`, and `DEPLOYMENT_OPTIONS.md` for more
- For advanced deployment, see `SERVICES_DEPLOYMENT_GUIDE.md`
