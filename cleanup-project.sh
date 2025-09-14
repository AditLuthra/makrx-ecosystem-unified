#!/bin/bash

echo "🧹 Cleaning up MakrX Ecosystem project files..."

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

# Remove unnecessary script files (keep only essential ones)
echo "🗑️  Removing redundant script files..."
rm -f \
	check-status.sh \
	cleanup-for-production.sh \
	debug-containers.sh \
	debug-grafana.sh \
	deploy-docker-staging.sh \
	EXECUTE_FINAL_SETUP.sh \
	finalize-for-github.sh \
	fix-and-restart.sh \
	fix-dependencies.sh \
	fix-grafana.sh \
	fix-lint-issues.sh \
	force-install-deps.sh \
	prepare-for-contributors.sh \
	run-ci-locally.sh \
	setup_and_start.sh \
	start-backends.sh \
	start-dev.sh \
	start-for-ci.sh \
	start-full-ecosystem.sh \
	start-simple.sh \
	stop-backends.sh \
	stop-full-ecosystem.sh \
	test-node.js \
	test-setup.sh \
	test-single-app.sh \
	validate-post-commit.sh \
	validate-staging.sh \
	verify-setup.sh

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
echo "   Scripts: diagnose.sh, start.sh, start-simple-dev.sh"
echo "   Docs: README.md, INSTALLATION.md, CONTRIBUTING.md, QUICK_START.md"
echo "   Docker: docker-compose.yml, docker-compose.prod.yml"
