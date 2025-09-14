#!/bin/bash

echo "🧹 Final MakrX Ecosystem Cleanup"
echo "================================"

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

# Remove all unnecessary script files
echo "🗑️  Removing redundant scripts..."
find . -maxdepth 1 -type f -name "*.sh" ! -name "start.sh" ! -name "start-simple-dev.sh" ! -name "stop.sh" ! -name "diagnose.sh" ! -name "deploy.sh" ! -name "final-cleanup.sh" -delete

# Remove redundant documentation
echo "📄 Removing duplicate docs..."
rm -f DEPLOYMENT_OPTIONS.md FINAL_SETUP.md GITHUB_READY_CHECKLIST.md MAKRX_ECOSYSTEM_READY.md PREPARE_FOR_GITHUB.md README-OLD.md EXECUTE_FINAL_SETUP.sh

# Remove redundant Docker files
echo "🐳 Cleaning Docker configs..."
rm -f docker-compose.ci.yml docker-compose.staging.yml

# Remove test files
echo "🧪 Removing test files..."
rm -f test-node.js

# Clean build artifacts
echo "🏗️  Cleaning build artifacts..."
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pid" -delete 2>/dev/null || true

# Show what remains
echo ""
echo "✅ Cleanup complete! Essential files remaining:"
ls -la *.sh *.md 2>/dev/null | grep -E "\.(sh|md)$" || true

echo ""
echo "📁 Project structure is now clean and optimized"