#!/bin/bash

# Make script executable
chmod +x "$0" 2>/dev/null || true

cd "$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'  
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() { echo -e "${BLUE}$1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_step() { echo -e "${PURPLE}🔧 $1${NC}"; }

echo "🔧 MakrX Ecosystem - Fix and Restart"
echo "===================================="

print_step "1. Stopping all containers..."
docker-compose down

print_step "2. Cleaning up any orphaned containers..."
docker-compose down --remove-orphans

print_step "3. Checking and creating required directories..."
mkdir -p services/postgres/init-scripts
mkdir -p services/keycloak/realm-config
mkdir -p logs

print_step "4. Checking if .env file exists..."
if [ ! -f ".env" ]; then
    print_warning ".env file missing. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env from example"
    else
        print_warning "Creating minimal .env file..."
        cat > .env << 'EOF'
# Database Configuration
POSTGRES_DB=makrx_ecosystem
POSTGRES_USER=makrx
POSTGRES_PASSWORD=makrx_dev_password
POSTGRES_PORT=5433

# Redis Configuration
REDIS_PORT=6380

# Keycloak Configuration
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin123
KEYCLOAK_PORT=8081

# MinIO Configuration
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
MINIO_PORT=9002
MINIO_CONSOLE_PORT=9003
EOF
        print_success "Created minimal .env file"
    fi
fi

print_step "5. Checking init scripts..."
if [ ! -f "services/postgres/init-scripts/01-create-databases.sql" ]; then
    print_warning "Creating basic init script..."
    cat > services/postgres/init-scripts/01-create-databases.sql << 'EOF'
-- Create databases for different services if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'makrx_ecosystem') THEN
        PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE makrx_ecosystem');
    END IF;
END $$;

-- Create basic tables if they don't exist
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'ok',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO health_check (status) VALUES ('initialized') ON CONFLICT DO NOTHING;
EOF
    print_success "Created init script"
fi

print_step "6. Starting PostgreSQL first..."
docker-compose up -d postgres

print_status "Waiting for PostgreSQL to initialize..."
sleep 15

# Check PostgreSQL with better error handling
print_status "Testing PostgreSQL connection..."
for i in {1..12}; do
    if docker-compose exec -T postgres pg_isready -U makrx -d makrx_ecosystem > /dev/null 2>&1; then
        print_success "PostgreSQL is ready!"
        break
    else
        if [ $i -eq 12 ]; then
            print_error "PostgreSQL failed to start after 60 seconds"
            echo "PostgreSQL logs:"
            docker-compose logs postgres
            exit 1
        else
            echo "Attempt $i/12: Still waiting for PostgreSQL..."
            sleep 5
        fi
    fi
done

print_step "7. Starting remaining infrastructure services..."
docker-compose up -d redis minio

print_step "8. Starting Keycloak (this will take a moment)..."
docker-compose up -d keycloak

print_status "Waiting for all services..."
sleep 20

# Final health check
print_step "9. Final health check..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U makrx -d makrx_ecosystem > /dev/null 2>&1; then
    print_success "✅ PostgreSQL: Ready"
else
    print_error "❌ PostgreSQL: Not Ready"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
    print_success "✅ Redis: Ready"
else
    print_error "❌ Redis: Not Ready"
fi

# Check MinIO
if curl -f http://localhost:9002/minio/health/live > /dev/null 2>&1; then
    print_success "✅ MinIO: Ready"
else
    print_warning "⚠️  MinIO: Not Ready (may still be starting)"
fi

# Check Keycloak
if curl -f http://localhost:8081/health/ready > /dev/null 2>&1; then
    print_success "✅ Keycloak: Ready"
else
    print_warning "⚠️  Keycloak: Not Ready (may still be starting)"
fi

echo ""
echo "🎯 Infrastructure Status:"
docker-compose ps

echo ""
print_success "Infrastructure restart complete!"
echo ""
echo "You can now run: ./run-ci-locally.sh"
echo ""
echo "If you still have issues:"
echo "1. Check logs: docker-compose logs [service-name]"
echo "2. Debug further: ./debug-containers.sh"
echo "3. Full reset: docker-compose down -v && ./fix-and-restart.sh"
echo ""

exit 0