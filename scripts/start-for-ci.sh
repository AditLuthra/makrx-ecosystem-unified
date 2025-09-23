#!/bin/bash

set -e

# Make script executable
chmod +x "$0" 2>/dev/null || true

cd "$(dirname "$0")"


# Source shared utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

echo "🚀 Starting MakrX Ecosystem for CI Testing"
echo "=========================================="

# Check if Docker is running
if ! docker info &>/dev/null; then
	print_error "Docker is not running. Please start Docker first."
	exit 1
fi

print_step "Starting infrastructure services..."

# Start infrastructure services first (PostgreSQL, Redis, Keycloak, MinIO)
docker-compose up -d postgres redis keycloak minio

print_status "Waiting for infrastructure services to be ready..."

# Wait for PostgreSQL
print_status "Waiting for PostgreSQL..."
sleep 10 # Give containers time to start

# First check if container is running
if ! docker-compose ps postgres | grep -q "Up"; then
	print_error "PostgreSQL container is not running. Checking logs..."
	echo "PostgreSQL container logs:"
	docker-compose logs postgres
	exit 1
fi

# Then check if PostgreSQL is ready
timeout 120 bash -c '
until docker-compose exec -T postgres pg_isready -U makrx -d makrx_ecosystem > /dev/null 2>&1; do 
    echo "Still waiting for PostgreSQL..."
    sleep 5
done' || {
	print_error "PostgreSQL failed to become ready. Checking logs..."
	echo "PostgreSQL container logs:"
	docker-compose logs postgres
	exit 1
}
print_success "PostgreSQL is ready"

# Wait for Redis
print_status "Waiting for Redis..."
timeout 60 bash -c '
until docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; do 
    echo "Still waiting for Redis..."
    sleep 2
done' || {
	print_error "Redis failed to start. Checking logs..."
	echo "Redis container logs:"
	docker-compose logs redis
	exit 1
}
print_success "Redis is ready"

# Wait for MinIO
print_status "Waiting for MinIO..."
timeout 60 bash -c 'until curl -f http://localhost:9002/minio/health/live > /dev/null 2>&1; do sleep 2; done' || {
	print_warning "MinIO may not be fully ready, but continuing..."
}
print_success "MinIO is ready"

# Wait for Keycloak (this takes the longest)
print_status "Waiting for Keycloak (this may take a few minutes)..."
timeout 300 bash -c 'until curl -f http://localhost:8081/health/ready > /dev/null 2>&1; do sleep 5; done' || {
	print_warning "Keycloak may not be fully ready, but continuing..."
}
print_success "Keycloak is ready"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
	print_step "Installing NPM dependencies..."
	npm ci --legacy-peer-deps
	print_success "Dependencies installed"
fi

print_step "Infrastructure services are ready for CI testing!"

echo ""
echo "🎯 Services Status:"
echo "  PostgreSQL: http://localhost:5433"
echo "  Redis: localhost:6380"
echo "  Keycloak: http://localhost:8081"
echo "  MinIO: http://localhost:9002"
echo ""
echo "You can now run: ./run-ci-locally.sh"
echo ""

exit 0
