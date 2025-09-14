#!/bin/bash

# MakrX Ecosystem - Production Cleanup Script
# Prepares the repository for GitHub and contributors

set -e

echo "🧹 CLEANING UP MAKRX ECOSYSTEM FOR PRODUCTION"
echo "=============================================="

# Function to safely remove files/directories if they exist
safe_remove() {
    if [ -e "$1" ]; then
        echo "🗑️  Removing: $1"
        rm -rf "$1"
    fi
}

# Remove temporary files and build artifacts
echo "📂 Removing temporary files and build artifacts..."

# Next.js build outputs
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "build" -type d -exec rm -rf {} + 2>/dev/null || true

# Python cache and build artifacts
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name ".pytest_cache" -type d -exec rm -rf {} + 2>/dev/null || true

# Node modules in individual apps (will be reinstalled via workspace)
find apps/ -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find backends/ -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find packages/ -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# Temporary and log files
safe_remove "logs/"
safe_remove "coverage/"
safe_remove "ci-results/"
safe_remove "test-results/"
safe_remove ".tmp/"
safe_remove "temp/"

# Development-only files
safe_remove "debug-*.sh"
safe_remove "test-*.py"
safe_remove "validate-*.sh"
safe_remove "show_current_files.py"
safe_remove "quick_validation.py"
safe_remove "final_integration_test.py"
safe_remove "comprehensive-audit.py"
safe_remove "test-validation-fix.py"
safe_remove "validate_ecosystem.py"

# Migration artifacts
safe_remove "check-missing-files.sh"
safe_remove "run-comprehensive-audit.sh"
safe_remove "fix-integration-issues.sh"
safe_remove "force-cleanup.sh"

# Temporary documentation files
safe_remove "CI_CD_SETUP.md"
safe_remove "CI_CD_SUMMARY.md"
safe_remove "DEPLOYMENT_SUCCESS_SUMMARY.md"
safe_remove "ECOSYSTEM_READY.md"
safe_remove "EXCELLENT_PROGRESS.md"
safe_remove "MIGRATION_COMPLETE_SUMMARY.md"
safe_remove "QUICK_FIX_INSTRUCTIONS.md"
safe_remove "README_CI_QUICK_START.md"
safe_remove "run-ci-now.md"

# Keep essential scripts but clean up development-only ones
safe_remove "docker-ci-environment.sh"
safe_remove "install-kubectl.sh"
safe_remove "setup-cicd.sh"
safe_remove "setup-npm.sh"

echo "✅ Cleanup completed!"
echo ""
echo "📋 Remaining essential files:"
echo "   - Core application files"
echo "   - Production deployment files"
echo "   - Documentation"
echo "   - Configuration files"
echo ""
echo "🎯 Next: Run './prepare-for-contributors.sh' to set up contributor environment"