#!/bin/bash

# Make script executable
chmod +x "$0" 2>/dev/null || true

cd "$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'  
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}$1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo "🔍 Debugging MakrX Docker Containers"
echo "===================================="

print_status "1. Checking Docker daemon status..."
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
else
    print_success "Docker daemon is running"
fi

print_status "2. Checking container status..."
docker-compose ps

print_status "3. Checking PostgreSQL container logs..."
echo "Last 20 lines of PostgreSQL logs:"
docker-compose logs --tail=20 postgres

print_status "4. Checking if PostgreSQL is actually responding..."
if docker-compose exec -T postgres pg_isready -U makrx -d makrx_ecosystem 2>/dev/null; then
    print_success "PostgreSQL is ready and responding"
else
    print_warning "PostgreSQL is not ready yet or has issues"
fi

print_status "5. Checking PostgreSQL environment variables..."
docker-compose exec -T postgres env | grep POSTGRES || echo "No PostgreSQL environment found"

print_status "6. Checking if init scripts directory exists..."
if [ -d "./services/postgres/init-scripts" ]; then
    print_success "Init scripts directory exists"
    ls -la ./services/postgres/init-scripts/
else
    print_warning "Init scripts directory missing - will create it"
    mkdir -p ./services/postgres/init-scripts
fi

print_status "7. Checking Docker volumes..."
docker volume ls | grep postgres || echo "No postgres volumes found"

print_status "8. Trying to connect to PostgreSQL directly..."
timeout 10 docker-compose exec -T postgres psql -U makrx -d makrx_ecosystem -c "SELECT version();" 2>/dev/null && print_success "PostgreSQL connection successful" || print_warning "Cannot connect to PostgreSQL"

print_status "9. Checking if .env file exists..."
if [ -f ".env" ]; then
    print_success ".env file exists"
    echo "PostgreSQL-related environment variables:"
    grep -E "POSTGRES|DATABASE" .env || echo "No PostgreSQL variables in .env"
else
    print_warning ".env file missing"
fi

echo ""
print_status "🛠️  Suggested fixes:"
echo "If PostgreSQL container is failing:"
echo "1. Try: docker-compose down -v && docker-compose up -d postgres"
echo "2. Check if port 5433 is available: netstat -tlnp | grep 5433"
echo "3. Ensure init scripts directory exists: mkdir -p services/postgres/init-scripts"
echo "4. Check Docker disk space: docker system df"
echo ""

if [ "$1" = "--fix" ]; then
    print_status "🔧 Applying common fixes..."
    
    # Stop containers
    docker-compose down
    
    # Create missing directories
    mkdir -p services/postgres/init-scripts
    mkdir -p services/keycloak/realm-config
    
    # Create a simple init script if none exists
    if [ ! -f "services/postgres/init-scripts/01-init.sql" ]; then
        cat > services/postgres/init-scripts/01-init.sql << 'EOF'
-- Create databases if they don't exist
SELECT 'CREATE DATABASE makrx_ecosystem' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'makrx_ecosystem')\gexec
EOF
        print_success "Created basic init script"
    fi
    
    # Start only PostgreSQL first
    print_status "Starting PostgreSQL with fresh volumes..."
    docker-compose up -d postgres
    
    # Wait a bit longer
    print_status "Waiting for PostgreSQL to initialize (60 seconds)..."
    sleep 60
    
    # Check again
    if docker-compose exec -T postgres pg_isready -U makrx -d makrx_ecosystem; then
        print_success "PostgreSQL is now ready!"
    else
        print_error "PostgreSQL still not ready. Check logs above."
    fi
fi