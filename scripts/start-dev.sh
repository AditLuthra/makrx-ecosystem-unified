#!/bin/bash
set -e

echo "🚀 Starting MakrX Unified Ecosystem - Development Mode"
echo "====================================================="


# Source shared utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

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

# Dynamically detect and start all apps in apps/
APPS_DIR="apps"
START_PORT=3000
PIDS=()

if [ ! -d "$APPS_DIR" ]; then
	echo -e "${RED}❌ No apps/ directory found!${NC}"
	exit 1
fi

PORT=$START_PORT
for app_path in "$APPS_DIR"/*; do
	if [ -d "$app_path" ]; then
		app_name=$(basename "$app_path")
		echo -e "${GREEN}   Starting $app_name on port $PORT...${NC}"
		# Try to detect package manager and start script
		if [ -f "$app_path/package.json" ]; then
			(cd "$app_path" && PORT=$PORT npm run dev >"../../logs/${app_name}.log" 2>&1 &)
			pid=$!
			echo $pid >".${app_name}.pid"
			PIDS+=("$pid")
		elif [ -f "$app_path/manage.py" ]; then
			(cd "$app_path" && PORT=$PORT python manage.py runserver 0.0.0.0:$PORT >"../../logs/${app_name}.log" 2>&1 &)
			pid=$!
			echo $pid >".${app_name}.pid"
			PIDS+=("$pid")
		else
			echo -e "${YELLOW}   Skipping $app_name (no recognized start script)${NC}"
		fi
		PORT=$((PORT+1))
	fi
	# else skip non-directory
done


# Start applications
echo -e "${BLUE}🚀 Starting applications...${NC}"

PORT=$START_PORT
for app_path in "$APPS_DIR"/*; do
	if [ -d "$app_path" ]; then
		app_name=$(basename "$app_path")
		echo "   $app_name: http://localhost:$PORT"
		PORT=$((PORT+1))
	fi
done
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


# Use shared cleanup_apps for app shutdown
cleanup() {
    cleanup_apps "$APPS_DIR"
    echo -e "${BLUE}🐳 Stopping Docker services...${NC}"
    docker-compose down
    echo -e "${GREEN}👋 MakrX Ecosystem stopped successfully${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
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
