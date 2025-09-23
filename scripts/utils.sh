#!/bin/bash
# MakrX Ecosystem - Shared Utility Functions
# Source this file in other scripts: source "$(dirname "$0")/utils.sh"

# Check if a port is available (returns 0 if available, 1 if in use)
check_port() {
    local port=$1
    if lsof -i :$port &>/dev/null; then
        # Port is in use
        return 1
    else
        # Port is available
        return 0
    fi
}

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Colored output helpers
print_status() { echo -e "${BLUE}$1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_step() { echo -e "${PURPLE}🚀 $1${NC}"; }

# Wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" &>/dev/null; then
            print_success "$service_name is ready"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    print_warning "$service_name not ready within timeout"
    return 1
}

# Cleanup function for shutting down apps and cleaning up PID files
cleanup_apps() {
    local apps_dir=${1:-"$APPS_DIR"}
    if [ -z "$apps_dir" ]; then
        print_error "APPS_DIR not set."
        return 1
    fi
    echo ""
    print_warning "🛑 Shutting down MakrX Ecosystem..."
    for app_path in "$apps_dir"/*; do
        if [ -d "$app_path" ]; then
            app_name=$(basename "$app_path")
            if [ -f ".${app_name}.pid" ]; then
                pid=$(cat ".${app_name}.pid")
                if kill -0 "$pid" 2>/dev/null; then
                    kill "$pid"
                    print_status "Stopped $app_name (PID $pid)"
                fi
                rm -f ".${app_name}.pid"
            fi
        fi
    done
}
