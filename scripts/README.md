# MakrX Ecosystem Scripts

This folder contains utility and management scripts for the MakrX ecosystem. Below is a summary of each script, its main function(s), and use case. Duplicate or similar functions across scripts are also noted.

---

## Script Overview

### 1. `start-ecosystem.sh`

- **Purpose:** Starts the MakrX ecosystem in either development or simple mode.
- **Usage:** `./start-ecosystem.sh [dev|simple]` (default: dev)
- **Key Functions:**
  - Starts infrastructure (Docker Compose) and all apps in the `apps/` directory.
  - `cleanup()`: Shuts down all running app processes and cleans up PID files.
- **Use Case:**
  - **dev:** For local development with all services and apps (dynamic app detection).
  - **simple:** For quick local testing with a fixed set of core apps.

> **Note:** The following scripts have been merged or replaced by the above:
>
> - `start-dev.sh`, `start-simple.sh`, `start-simple-dev.sh`, `start-backends.sh`, `start.sh`
> - Use `start-ecosystem.sh` or `start-full-ecosystem.sh` as appropriate.

### 2. `start-full-ecosystem.sh`

- **Purpose:** Starts all frontend, backend, and infrastructure services (full stack, including advanced checks).
- **Use Case:** For full local or CI environment startup.

### 3. `stop-full-ecosystem.sh`

- **Purpose:** Stops all services started by `start-full-ecosystem.sh`.
- **Use Case:** To cleanly shut down the full ecosystem.

> **Note:** The following scripts have been merged or replaced by the above:
>
> - `stop-backends.sh`, `stop.sh`
> - Use `stop-full-ecosystem.sh` for stopping all services.

### 5. `deploy.sh`

- **Purpose:** Deploys the ecosystem to Kubernetes or Docker.
- **Key Functions:**
  - `print_status()`, `print_success()`, `print_warning()`, `print_error()`, `print_step()`: Colored output helpers. (Also in other scripts)
  - `usage()`: Shows usage instructions.
- **Use Case:** For CI/CD or manual deployments.

### 6. `deploy-docker-staging.sh`

- **Purpose:** Deploys the ecosystem to a local Docker Compose staging environment.
- **Key Functions:**
  - Same colored output helpers as in `deploy.sh`.
- **Use Case:** For local staging/testing with Docker Compose.

### 7. `cleanup-for-production.sh`

- **Purpose:** Cleans up files and directories for production or GitHub readiness.
- **Key Functions:**
  - `safe_remove()`: Removes files/directories if they exist.
- **Use Case:** To prepare the repo for production or open source.

### 8. `cleanup-project.sh`

- **Purpose:** Removes redundant or development-only scripts and files.
- **Use Case:** To keep the repo clean and production-ready.

### 9. `prepare-for-contributors.sh`

- **Purpose:** Sets up the environment for new contributors.
- **Key Functions:**
  - `start_service()`: Starts a frontend app in the background.
- **Use Case:** For onboarding contributors.

### 10. `setup_and_start.sh`

- **Purpose:** Complete setup and startup of the ecosystem.
- **Key Functions:**
  - Colored output helpers, `wait_for_service()`.
- **Use Case:** For first-time setup or CI pipelines.

### 11. `finalize-for-github.sh`

- **Purpose:** Finalizes the repo for GitHub, runs cleanup and setup scripts.
- **Key Functions:**
  - Colored output helpers.
- **Use Case:** For maintainers before publishing to GitHub.

### 12. `EXECUTE_FINAL_SETUP.sh`

- **Purpose:** Runs the final setup for GitHub readiness.
- **Use Case:** One-command setup for maintainers.

### 13. `create_blocker_issues.sh`

- **Purpose:** Automates creation of GitHub issues for blockers.
- **Key Functions:**
  - `mk()`: Helper for creating issues via GitHub CLI.
- **Use Case:** For project management and tracking blockers.

### 14. `test-setup.sh`, `validate-post-commit.sh`, `validate-staging.sh`, `verify-setup.sh`

- **Purpose:** Validation and verification scripts for setup, CI, and staging.
- **Use Case:** For CI/CD and manual validation.

### 15. `check-status.sh`, `diagnose.sh`

- **Purpose:** (Currently empty or placeholder scripts.)

---

For more details, see comments in each script or run with `--help`/`usage` if available.
