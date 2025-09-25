#!/bin/bash
# uninstall-and-purge.sh: Removes MakrX ecosystem files, containers, images, and related data from the system.

set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Purging MakrX ecosystem..."

# Stop all running services
if [ -f "$REPO_DIR/scripts/stop.sh" ]; then
  bash "$REPO_DIR/scripts/stop.sh"
fi

# Remove Docker containers, images, volumes, and networks related to MakrX
cd "$REPO_DIR"
echo "Removing Docker containers, images, volumes, and networks..."
docker-compose down -v --remove-orphans || true
docker system prune -af --volumes || true

echo "Removing Python virtual environments..."
find "$REPO_DIR/backends" -type d -name "venv" -exec rm -rf {} +

# Remove node_modules and build artifacts
echo "Removing node_modules and build artifacts..."
find "$REPO_DIR" -type d -name "node_modules" -exec rm -rf {} +
find "$REPO_DIR" -type d -name ".next" -exec rm -rf {} +
find "$REPO_DIR" -type d -name "dist" -exec rm -rf {} +
find "$REPO_DIR" -type d -name "build" -exec rm -rf {} +

# Remove databases and logs
echo "Removing databases and logs..."
rm -f "$REPO_DIR/test.db"
rm -rf "$REPO_DIR/logs"
rm -rf "$REPO_DIR/monitoring"

# Remove .env and environment files
echo "Removing environment files..."
rm -f "$REPO_DIR/.env"
find "$REPO_DIR/apps" -type f -name ".env.local" -exec rm -f {} +
find "$REPO_DIR/backends" -type f -name ".env" -exec rm -f {} +

# Remove cache and pycache
find "$REPO_DIR" -type d -name "__pycache__" -exec rm -rf {} +
find "$REPO_DIR" -type d -name ".pytest_cache" -exec rm -rf {} +

# Remove venv in repo root if exists
rm -rf "$REPO_DIR/venv"

# Final message
echo "MakrX ecosystem and all related files have been purged."
