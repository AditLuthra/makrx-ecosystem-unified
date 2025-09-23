#!/bin/bash
set -e

echo "🚀 Starting MakrX Unified Ecosystem - Simple Mode"
echo "================================================="


# Source shared utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

# Load environment variables
if [ -f .env ]; then
	source .env
fi

# Create logs directory
mkdir -p logs

# Start infrastructure services
echo -e "${BLUE}🐳 Starting Docker services...${NC}"
docker-compose up -d postgres redis keycloak minio

echo -e "${BLUE}⏳ Waiting 15 seconds for services to initialize...${NC}"
sleep 15

# Check Docker container status
echo -e "${BLUE}📊 Docker Container Status:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep makrx

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
	echo -e "${BLUE}📦 Installing dependencies...${NC}"
	npm install --silent
fi

# Array of apps to start
declare -A APPS
APPS[gateway - frontend]=3000
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
		cd "apps/$app"

		# Start in background
		PORT=$port npm run dev >"../../logs/${app}.log" 2>&1 &
		pid=$!
		PIDS+=($pid)

		# Store PID for cleanup
		echo $pid >"../../.${app}.pid"

		cd ../..
		sleep 2
	else
		echo -e "${YELLOW}   Skipping $app (not found)${NC}"
	fi
done

echo ""
echo -e "${GREEN}🎉 MakrX Ecosystem Started!${NC}"
echo "============================="
echo -e "${BLUE}🌐 Application URLs:${NC}"
echo "   Gateway Frontend:        http://localhost:3000"
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
echo ""
echo -e "${YELLOW}📝 Logs are available in the logs/ directory${NC}"
echo -e "${YELLOW}🛑 Press Ctrl+C to stop all services${NC}"
echo "============================="

# Function to cleanup on exit

# Use shared cleanup_apps for app shutdown
cleanup() {
    cleanup_apps "apps"
    echo -e "${BLUE}🐳 Stopping Docker services...${NC}"
    docker-compose down
    echo -e "${GREEN}👋 MakrX Ecosystem stopped successfully${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
