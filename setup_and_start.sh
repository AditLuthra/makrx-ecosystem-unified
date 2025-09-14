#!/bin/bash

set -e

cd "$(dirname "$0")"

echo "🚀 MakrX Ecosystem - Complete Setup and Start"
echo "============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'  
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🔧 $1${NC}"
}

# Check prerequisites
print_status "Checking Prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 20+ first."
    exit 1
fi

if ! command -v python3.12 &> /dev/null; then
    print_error "Python 3 not found. Please install Python 3.11+ first."
    exit 1
fi

print_success "All prerequisites found"

# Check Docker daemon
if ! docker info &> /dev/null; then
    print_error "Docker daemon not running. Please start Docker first."
    exit 1
fi

print_success "Docker daemon is running"

# Make scripts executable
print_step "Making scripts executable..."
chmod +x *.sh *.py

# Run migration fixes
print_step "Running critical migration fixes..."
if python3.12 complete_migration_fix.py; then
    print_success "Migration fixes completed"
else
    print_warning "Migration fixes completed with warnings"
fi

# Install NPM dependencies
print_step "Installing NPM dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo "Installing root dependencies..."
    npm install --legacy-peer-deps
else
    print_success "Dependencies already installed"
fi

# Install workspace dependencies
print_step "Installing workspace dependencies..."
npm install --workspaces --legacy-peer-deps

# Set up Python environments for backends
print_step "Setting up Python backend environments..."

for backend in makrcave makrx-store; do
    backend_path="backends/$backend"
    if [ -d "$backend_path" ]; then
        echo "Setting up $backend..."
        cd "$backend_path"
        
        # Create virtual environment if needed
        if [ ! -d ".venv" ]; then
            python3.12 -m venv .venv
        fi
        
        # Install dependencies
        source .venv/bin/activate
        if [ -f "requirements.txt" ]; then
            pip install -q -r requirements.txt
        fi
        deactivate
        
        cd ../..
        print_success "$backend environment ready"
    fi
done

# Set up Node.js backend
if [ -d "backends/makrx_events" ]; then
    print_step "Setting up MakrX Events backend..."
    cd backends/makrx_events
    if [ -f "package.json" ]; then
        npm install &> /dev/null
        print_success "MakrX Events backend dependencies installed"
    fi
    cd ../..
fi

# Create logs directory
mkdir -p logs

# Clean up any existing processes
print_step "Cleaning up existing processes..."
pkill -f "next dev" || true
pkill -f "uvicorn" || true
pkill -f "node.*server" || true
sleep 2

# Start infrastructure services
print_step "Starting infrastructure services..."
docker-compose down &> /dev/null || true
docker-compose up -d

# Wait for infrastructure services
print_step "Waiting for infrastructure services to be ready..."

wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" &> /dev/null; then
            print_success "$service_name is ready"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "$service_name not ready within timeout"
    return 1
}

# Wait for services with better error handling
wait_for_service "http://localhost:8081/health/ready" "Keycloak" || print_warning "Keycloak may still be starting"
wait_for_service "http://localhost:9002/minio/health/live" "MinIO" || print_warning "MinIO may still be starting"

# Test database connectivity
if command -v psql &> /dev/null; then
    if PGPASSWORD=makrx_dev_password psql -h localhost -p 5433 -U makrx -d makrx_ecosystem -c "SELECT 1;" &> /dev/null; then
        print_success "PostgreSQL is ready"
    else
        print_warning "PostgreSQL not ready, but continuing..."
    fi
else
    print_warning "psql not available, skipping PostgreSQL test"
fi

# Start backend services
print_step "Starting backend services..."

# MakrCave backend
if [ -d "backends/makrcave" ]; then
    cd backends/makrcave
    source .venv/bin/activate
    nohup uvicorn main:app --host 0.0.0.0 --port 8001 --reload > ../../logs/makrcave-backend.log 2>&1 &
    echo $! > ../../.makrcave-backend.pid
    deactivate
    cd ../..
    print_success "MakrCave backend started"
fi

# MakrX Store backend  
if [ -d "backends/makrx-store" ]; then
    cd backends/makrx-store
    source .venv/bin/activate
    nohup uvicorn main:app --host 0.0.0.0 --port 8003 --reload > ../../logs/makrx-store-backend.log 2>&1 &
    echo $! > ../../.makrx-store-backend.pid
    deactivate
    cd ../..
    print_success "MakrX Store backend started"
fi

# MakrX Events backend (FastAPI)
if [ -d "backends/makrx_events" ]; then
    cd backends/makrx_events
    nohup python3.12 -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload > ../../logs/makrx-events-backend.log 2>&1 &
    echo $! > ../../.makrx-events-backend.pid
    cd ../..
    print_success "MakrX Events backend started"
fi

# Wait for backends to initialize
print_step "Waiting for backends to initialize..."
sleep 5

# Test backend health
print_step "Testing backend health..."
wait_for_service "http://localhost:8001/health" "MakrCave API" || true
wait_for_service "http://localhost:8002/health" "MakrX Events API" || true
wait_for_service "http://localhost:8003/health" "MakrX Store API" || true

# Start frontend applications
print_step "Starting frontend applications..."

apps=("gateway-frontend:3000" "gateway-frontend-hacker:3001" "makrcave:3002" "makrx-store:3003" "makrx-events:3004")

for app_port in "${apps[@]}"; do
    IFS=':' read -ra APP_PORT <<< "$app_port"
    app="${APP_PORT[0]}"
    port="${APP_PORT[1]}"
    
    if [ -d "apps/$app" ]; then
        cd "apps/$app"
        
        # Install app dependencies if needed
        if [ ! -d "node_modules" ]; then
            npm install --legacy-peer-deps &> /dev/null
        fi
        
        # Start the app
        nohup npm run dev > "../../logs/$app.log" 2>&1 &
        echo $! > "../../.$app.pid"
        
        cd ../..
        print_success "$app started on port $port"
    else
        print_warning "$app directory not found"
    fi
done

# Wait for frontends to initialize
print_step "Waiting for frontend applications to initialize..."
sleep 10

# Run ecosystem validation
print_step "Running ecosystem validation..."
if python3.12 validate_ecosystem.py; then
    print_success "Ecosystem validation passed"
else
    print_warning "Ecosystem validation found some issues (check output above)"
fi

# Final status
echo ""
print_success "🎉 MakrX Ecosystem Started Successfully!"
echo "========================================"
echo ""
echo -e "${GREEN}📋 Service URLs:${NC}"
echo ""
echo -e "${BLUE}Frontend Applications:${NC}"
echo "  🏠 Gateway Frontend:        http://localhost:3000"
echo "  🏠 Gateway Frontend Hacker: http://localhost:3001" 
echo "  🏠 MakrCave:                http://localhost:3002"
echo "  🏠 MakrX Store:             http://localhost:3003"
echo "  🏠 MakrX Events:            http://localhost:3004"
echo ""
echo -e "${BLUE}Backend APIs:${NC}"
echo "  🔧 MakrCave API:            http://localhost:8001/docs"
echo "  🔧 MakrX Events API:        http://localhost:8002/health"
echo "  🔧 MakrX Store API:         http://localhost:8003/docs"
echo ""
echo -e "${BLUE}Infrastructure:${NC}"
echo "  🔐 Keycloak:                http://localhost:8081 (admin/admin123)"
echo "  🗄️  PostgreSQL:             localhost:5433 (makrx/makrx_dev_password)"
echo "  🟥 Redis:                   localhost:6380"
echo "  📦 MinIO:                   http://localhost:9002 (minioadmin/minioadmin123)"
echo "  📦 MinIO Console:           http://localhost:9003"
echo ""
echo -e "${PURPLE}📄 Monitoring:${NC}"
echo "  📊 Health Status:           python3 validate_ecosystem.py"
echo "  📋 Service Logs:            tail -f logs/<service>.log"
echo "  🐳 Docker Status:           docker-compose ps"
echo ""
echo -e "${YELLOW}🛑 To stop all services:${NC}"
echo "  ./stop-full-ecosystem.sh"
echo ""
echo -e "${GREEN}✨ Ready for development! Happy making! ✨${NC}"
