#!/bin/bash

set -e

cd "$(dirname "$0")"

echo "🚀 Starting MakrX Full Ecosystem"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
	command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
	lsof -ti:$1 >/dev/null 2>&1
}

# Function to wait for service
wait_for_service() {
	local url=$1
	local service_name=$2
	local max_attempts=30
	local attempt=1

	echo "⏳ Waiting for $service_name to be ready..."

	while [ $attempt -le $max_attempts ]; do
		if curl -s "$url" >/dev/null 2>&1; then
			echo -e "${GREEN}✅ $service_name is ready!${NC}"
			return 0
		fi

		echo "   Attempt $attempt/$max_attempts..."
		sleep 2
		attempt=$((attempt + 1))
	done

	echo -e "${RED}❌ $service_name failed to start within timeout${NC}"
	return 1
}

echo -e "${BLUE}📋 Pre-flight Checks${NC}"

# Check required tools
if ! command_exists docker; then
	echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
	exit 1
fi

if ! command_exists node; then
	echo -e "${RED}❌ Node.js not found. Please install Node.js 20+ first.${NC}"
	exit 1
fi

if ! command_exists python3.12; then
	echo -e "${RED}❌ Python 3 not found. Please install Python 3.11+ first.${NC}"
	exit 1
fi

echo -e "${GREEN}✅ All required tools found${NC}"

# Check Docker is running
if ! docker info >/dev/null 2>&1; then
	echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
	exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Apply critical fixes first
echo -e "${BLUE}🔧 Applying Critical Fixes${NC}"
if [ -f "scripts/fix_all_critical_issues.py" ]; then
	python3.12 scripts/fix_all_critical_issues.py
else
	echo "(Skipping: scripts/fix_all_critical_issues.py not found)"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
	echo -e "${BLUE}📦 Installing NPM Dependencies${NC}"
	npm install --legacy-peer-deps
fi

# Set up Python environments for backends
echo -e "${BLUE}🐍 Setting up Python Environments${NC}"

for backend in makrcave makrx-store; do
	backend_path="backends/$backend"
	if [ -d "$backend_path" ]; then
		echo "Setting up $backend..."
		cd "$backend_path"

		# Create virtual environment if it doesn't exist
		if [ ! -d ".venv" ]; then
			python3.12 -m venv .venv
		fi

		# Activate and install dependencies
		source .venv/bin/activate

		if [ -f "requirements.txt" ]; then
			pip install -q -r requirements.txt
		fi

		deactivate
		cd ../..
		echo -e "${GREEN}✅ $backend Python environment ready${NC}"
	fi
done

# Clean up any existing processes
echo -e "${BLUE}🧹 Cleaning up existing processes${NC}"
pkill -f "next dev" || true
pkill -f "uvicorn" || true
pkill -f "node.*server" || true
sleep 2

# Start infrastructure services
echo -e "${BLUE}🐳 Starting Infrastructure Services${NC}"
docker-compose down || true
docker-compose up -d

# Wait for services to be healthy
wait_for_service "http://localhost:5433" "PostgreSQL" || true
wait_for_service "http://localhost:6380" "Redis" || true
wait_for_service "http://localhost:8081/health/ready" "Keycloak"
wait_for_service "http://localhost:9002/minio/health/live" "MinIO"

echo -e "${GREEN}✅ Infrastructure services are running${NC}"

# Import Keycloak realm if realm export exists
if [ -f "keycloak-realm-export.json" ]; then
	echo -e "${BLUE}🔐 Importing Keycloak Realm${NC}"
	# Note: In production, you'd use Keycloak admin API or volume mount
	echo "Realm export file found - configure manually via Keycloak admin console"
fi

# Start backend services
echo -e "${BLUE}🔧 Starting Backend Services${NC}"

# Start MakrCave backend
if [ -d "backends/makrcave" ]; then
	cd backends/makrcave
	source .venv/bin/activate
	nohup uvicorn main:app --host 0.0.0.0 --port 8001 --reload >../../logs/makrcave-backend.log 2>&1 &
	echo $! >../../.makrcave-backend.pid
	deactivate
	cd ../..
	echo -e "${GREEN}✅ MakrCave backend started (PID: $(cat .makrcave-backend.pid))${NC}"
fi

# Start MakrX Store backend
if [ -d "backends/makrx-store" ]; then
	cd backends/makrx-store
	source .venv/bin/activate
	nohup uvicorn main:app --host 0.0.0.0 --port 8003 --reload >../../logs/makrx-store-backend.log 2>&1 &
	echo $! >../../.makrx-store-backend.pid
	deactivate
	cd ../..
	echo -e "${GREEN}✅ MakrX Store backend started (PID: $(cat .makrx-store-backend.pid))${NC}"
fi

# Start MakrX Events backend (FastAPI)
if [ -d "backends/makrx_events" ]; then
	cd backends/makrx_events
	if [ ! -d ".venv" ]; then
		python3.12 -m venv .venv
	fi
	source .venv/bin/activate
	pip3 install -r requirements.txt >/dev/null 2>&1 || true
	nohup uvicorn main:app --host 0.0.0.0 --port 8002 --reload >../../logs/makrx-events-backend.log 2>&1 &
	echo $! >../../.makrx-events-backend.pid
	deactivate
	cd ../..
	echo -e "${GREEN}✅ MakrX Events backend started (PID: $(cat .makrx-events-backend.pid))${NC}"
fi

# Wait for backends to start
sleep 5

# Test backend health
echo -e "${BLUE}🏥 Testing Backend Health${NC}"
wait_for_service "http://localhost:8001/health" "MakrCave Backend" || true
wait_for_service "http://localhost:8002/health" "MakrX Events Backend" || true
wait_for_service "http://localhost:8003/health" "MakrX Store Backend" || true

# Create logs directory
mkdir -p logs

# Start frontend applications
echo -e "${BLUE}🎨 Starting Frontend Applications${NC}"

apps=("gateway-frontend:3000" "gateway-frontend-hacker:3001" "makrcave:3002" "makrx-store:3003" "makrx-events:3004")

for app_port in "${apps[@]}"; do
	IFS=':' read -ra APP_PORT <<<"$app_port"
	app="${APP_PORT[0]}"
	port="${APP_PORT[1]}"

	if [ -d "apps/$app" ]; then
		cd "apps/$app"

		# Install dependencies if needed
		if [ ! -d "node_modules" ]; then
			npm install --legacy-peer-deps >/dev/null 2>&1
		fi

		# Start the app
		nohup npm run dev >"../../logs/$app.log" 2>&1 &
		echo $! >"../../.$app.pid"

		cd ../..
		echo -e "${GREEN}✅ $app started on port $port (PID: $(cat .$app.pid))${NC}"
	fi
done

# Wait for frontends to start
echo -e "${BLUE}⏳ Waiting for frontend applications to start...${NC}"
sleep 10

# Test frontend health
echo -e "${BLUE}🏥 Testing Frontend Health${NC}"
for app_port in "${apps[@]}"; do
	IFS=':' read -ra APP_PORT <<<"$app_port"
	app="${APP_PORT[0]}"
	port="${APP_PORT[1]}"

	if curl -s "http://localhost:$port" >/dev/null 2>&1; then
		echo -e "${GREEN}✅ $app is responding on port $port${NC}"
	else
		echo -e "${YELLOW}⚠️  $app may still be starting on port $port${NC}"
	fi
done

echo ""
echo -e "${GREEN}🎉 MakrX Ecosystem Started Successfully!${NC}"
echo "========================================"
echo ""
echo -e "${BLUE}📋 Service URLs:${NC}"
echo ""
echo -e "${GREEN}Frontend Applications:${NC}"
echo "  🏠 Gateway Frontend:        http://localhost:3000"
echo "  🏠 Gateway Frontend Hacker: http://localhost:3001"
echo "  🏠 MakrCave:                http://localhost:3002"
echo "  🏠 MakrX Store:             http://localhost:3003"
echo "  🏠 MakrX Events:            http://localhost:3004"
echo ""
echo -e "${GREEN}Backend APIs:${NC}"
echo "  🔧 MakrCave API:            http://localhost:8001 (docs: /docs)"
echo "  🔧 MakrX Events API:        http://localhost:8002 (health: /health)"
echo "  🔧 MakrX Store API:         http://localhost:8003 (docs: /docs)"
echo ""
echo -e "${GREEN}Infrastructure:${NC}"
echo "  🔐 Keycloak:                http://localhost:8081 (admin/admin123)"
echo "  🗄️  PostgreSQL:             localhost:5433 (makrx/makrx_dev_password)"
echo "  🟥 Redis:                   localhost:6380"
echo "  📦 MinIO:                   http://localhost:9002 (minioadmin/minioadmin123)"
echo "  📦 MinIO Console:           http://localhost:9003"
echo ""
echo -e "${BLUE}📄 Logs:${NC}"
echo "  Backend logs: logs/"
echo "  Check individual service logs: tail -f logs/<service>.log"
echo ""
echo -e "${BLUE}🛑 To stop all services:${NC}"
echo "  ./stop-full-ecosystem.sh"
echo ""
echo -e "${YELLOW}⚠️  Note: Initial startup may take a few minutes for all services to be fully ready${NC}"
