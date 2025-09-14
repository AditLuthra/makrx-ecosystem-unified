#!/bin/bash
set -e

echo "🚀 Starting MakrX Unified Ecosystem - Development Mode"
echo "====================================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
	source .env
fi

# Function to check if port is available
check_port() {
	local port=$1
	if lsof -i :$port >/dev/null 2>&1; then
		echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
		return 1
	fi
	return 0
}

# Function to wait for service
wait_for_service() {
	local service_name=$1
	local url=$2
	local max_attempts=30
	local attempt=0

	echo -e "${BLUE}⏳ Waiting for $service_name to be ready...${NC}"

	while [ $attempt -lt $max_attempts ]; do
		if curl -f -s "$url" >/dev/null 2>&1; then
			echo -e "${GREEN}✅ $service_name is ready${NC}"
			return 0
		fi

		attempt=$((attempt + 1))
		echo -e "${YELLOW}   Attempt $attempt/$max_attempts...${NC}"
		sleep 2
	done

	echo -e "${RED}❌ $service_name failed to start${NC}"
	return 1
}

# Check required ports
echo -e "${BLUE}🔍 Checking ports...${NC}"
PORTS=(3000 3001 3002 3003 3004 5433 6380 8081 9002 9003)

for port in "${PORTS[@]}"; do
	if ! check_port $port; then
		echo -e "${YELLOW}   Port $port in use, you may need to stop other services${NC}"
	fi
done

# Start infrastructure services
echo -e "${BLUE}🏗️  Starting infrastructure services...${NC}"

# Start Docker services
echo -e "${BLUE}🐳 Starting Docker Compose services...${NC}"
docker-compose up -d postgres redis keycloak minio

# Wait for core services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check if containers are running
postgres_status=$(docker inspect makrx-unified-postgres --format='{{.State.Status}}' 2>/dev/null || echo "not found")
redis_status=$(docker inspect makrx-unified-redis --format='{{.State.Status}}' 2>/dev/null || echo "not found")
keycloak_status=$(docker inspect makrx-unified-keycloak --format='{{.State.Status}}' 2>/dev/null || echo "not found")
minio_status=$(docker inspect makrx-unified-minio --format='{{.State.Status}}' 2>/dev/null || echo "not found")

echo -e "${BLUE}Container Status:${NC}"
echo "  PostgreSQL: $postgres_status"
echo "  Redis: $redis_status"
echo "  Keycloak: $keycloak_status"
echo "  MinIO: $minio_status"

# Function to install dependencies
install_deps() {
	if command -v pnpm &>/dev/null; then
		echo -e "${BLUE}📦 Installing dependencies with pnpm...${NC}"
		pnpm install
	else
		echo -e "${BLUE}📦 Installing dependencies with npm...${NC}"
		npm install
	fi
}

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
	install_deps
fi

# Array of apps to start
declare -A APPS
APPS[gateway - frontend]=3000
APPS[gateway - frontend - hacker]=3001
APPS[makrcave]=3002
APPS[makrx - store]=3003
APPS[makrx - events]=3004

# Start applications
echo -e "${BLUE}🚀 Starting applications...${NC}"

PIDS=()

for app in "${!APPS[@]}"; do
	port=${APPS[$app]}

	if [ -d "apps/$app" ]; then
		echo -e "${GREEN}   Starting $app on port $port...${NC}"

		# Start in background from root directory
		cd "apps/$app"
		PORT=$port npm run dev >"../../logs/${app}.log" 2>&1 &
		pid=$!
		cd ../..

		PIDS+=($pid)

		# Store PID for cleanup
		echo $pid >".${app}.pid"
		sleep 2
	else
		echo -e "${YELLOW}   Skipping $app (not found in apps/ directory)${NC}"
	fi
done

# Create logs directory
mkdir -p logs

# Check Docker container status
echo -e "${BLUE}🔍 Checking Docker container status...${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${GREEN}🎉 MakrX Ecosystem is starting up!${NC}"
echo "====================================================="
echo -e "${BLUE}🌐 Application URLs:${NC}"
echo "   Gateway Frontend:        http://localhost:3000"
echo "   Gateway Frontend Hacker: http://localhost:3001"
echo "   MakrCave:               http://localhost:3002"
echo "   MakrX Store:            http://localhost:3003"
echo "   MakrX Events:           http://localhost:3004"
echo ""
echo -e "${BLUE}🔧 Infrastructure URLs:${NC}"
echo "   Keycloak Admin:         http://localhost:8081"
echo "   MinIO Console:          http://localhost:9003"
echo "   PostgreSQL:             localhost:5433"
echo "   Redis:                  localhost:6380"
echo ""
echo -e "${BLUE}📋 Keycloak Admin Credentials:${NC}"
echo "   Username: admin"
echo "   Password: admin123"
echo "   URL: http://localhost:8081"
echo ""
echo -e "${BLUE}📋 MinIO Credentials:${NC}"
echo "   Access Key: minioadmin"
echo "   Secret Key: minioadmin123"
echo ""
echo -e "${YELLOW}📝 Logs are available in the logs/ directory${NC}"
echo -e "${YELLOW}🛑 Press Ctrl+C to stop all services${NC}"
echo "====================================================="

# Function to cleanup on exit
cleanup() {
	echo ""
	echo -e "${YELLOW}🛑 Shutting down MakrX Ecosystem...${NC}"

	# Kill application processes
	for app in "${!APPS[@]}"; do
		if [ -f ".${app}.pid" ]; then
			local pid=$(cat ".${app}.pid")
			if kill -0 $pid 2>/dev/null; then
				echo -e "${BLUE}   Stopping $app...${NC}"
				kill $pid
			fi
			rm -f ".${app}.pid"
		fi
	done

	# Stop Docker services
	echo -e "${BLUE}🐳 Stopping Docker services...${NC}"
	docker-compose down

	echo -e "${GREEN}👋 MakrX Ecosystem stopped successfully${NC}"
	exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
