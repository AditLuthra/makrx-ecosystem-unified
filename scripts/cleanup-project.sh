#!/bin/bash

echo "🧹 Cleaning up MakrX Ecosystem project files..."

# Move to repository root based on this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"
cd "$REPO_ROOT"

# Remove unnecessary script files (keep only essential ones)
echo "🗑️  Removing redundant script files..."
rm -f \
	scripts/check-status.sh \
	scripts/cleanup-for-production.sh \
	scripts/debug-containers.sh \
	scripts/debug-grafana.sh \
	scripts/deploy-docker-staging.sh \
	scripts/EXECUTE_FINAL_SETUP.sh \
	scripts/finalize-for-github.sh \
	scripts/fix-and-restart.sh \
	scripts/fix-dependencies.sh \
	scripts/fix-grafana.sh \
	scripts/fix-lint-issues.sh \
	scripts/force-install-deps.sh \
	scripts/prepare-for-contributors.sh \
	scripts/run-ci-locally.sh \
	scripts/setup_and_start.sh \
	scripts/start-backends.sh \
	scripts/start-dev.sh \
	scripts/start-for-ci.sh \
	scripts/start-full-ecosystem.sh \
	scripts/start-simple.sh \
	scripts/stop-backends.sh \
	scripts/stop-full-ecosystem.sh \
	scripts/test-node.js \
	scripts/test-setup.sh \
	scripts/test-single-app.sh \
	scripts/validate-post-commit.sh \
	scripts/validate-staging.sh \
	scripts/verify-setup.sh

# Remove redundant documentation files
echo "📄 Removing duplicate documentation files..."
rm -f \
	DEPLOYMENT_OPTIONS.md \
	FINAL_SETUP.md \
	GITHUB_READY_CHECKLIST.md \
	MAKRX_ECOSYSTEM_READY.md \
	PREPARE_FOR_GITHUB.md \
	README-OLD.md

# Clean up any PID files
echo "🧹 Cleaning up PID files..."
find . -name "*.pid" -delete

# Clean up build artifacts
echo "🏗️  Cleaning up build artifacts..."
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "build" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove unnecessary docker compose files (keep main one and prod)
echo "🐳 Cleaning up Docker compose files..."
rm -f \
	docker-compose.ci.yml \
	docker-compose.staging.yml

echo "✅ Project cleanup complete!"
echo ""
echo "📁 Remaining essential files:"
echo "   Scripts: scripts/diagnose.sh, scripts/start.sh, scripts/start-simple-dev.sh"
echo "   Docs: README.md, INSTALLATION.md, CONTRIBUTING.md, QUICK_START.md"
echo "   Docker: docker-compose.yml, docker-compose.prod.yml"
