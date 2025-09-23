#!/bin/bash
set -e

# MakrX Ecosystem - Unified Start Script
# Usage: ./start-ecosystem.sh [dev|simple] (default: dev)

MODE="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

APPS_DIR="apps"
START_PORT=3000
PIDS=()

# Load environment variables if present
if [ -f .env ]; then
    source .env
fi

mkdir -p logs

echo -e "${BLUE}🐳 Starting Docker services...${NC}"
docker-compose up -d postgres redis keycloak minio

if [ "$MODE" = "simple" ]; then
    echo -e "${BLUE}⏳ Waiting 15 seconds for services to initialize...${NC}"
    sleep 15
else
    echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
    sleep 10
fi

echo -e "${BLUE}📊 Docker Container Status:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep makrx

# App start logic
if [ "$MODE" = "simple" ]; then
    declare -A APPS
    APPS["gateway-frontend"]=3000
    APPS["makrcave"]=3002
    APPS["makrx-store"]=3003
    APPS["makrx-events"]=3004
    echo -e "${BLUE}🚀 Starting applications (simple mode)...${NC}"
    for app in "${!APPS[@]}"; do
        port=${APPS[$app]}
        if [ -d "$APPS_DIR/$app" ]; then
            echo -e "${GREEN}   Starting $app on port $port...${NC}"
            cd "$APPS_DIR/$app"
            PORT=$port npm run dev >"../../logs/${app}.log" 2>&1 &
            pid=$!
            cd ../..
            PIDS+=($pid)
            echo $pid >".${app}.pid"
            sleep 2
        else
            echo -e "${YELLOW}   Skipping $app (not found)${NC}"
        fi
    done
else
    echo -e "${BLUE}🚀 Starting applications (dev mode)...${NC}"
    PORT=$START_PORT
    for app_path in "$APPS_DIR"/*; do
        if [ -d "$app_path" ]; then
            app_name=$(basename "$app_path")
            echo -e "${GREEN}   Starting $app_name on port $PORT...${NC}"
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
    done
fi

echo ""
echo -e "${GREEN}🎉 MakrX Ecosystem Started!${NC}"
echo "============================="
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
echo ""
echo -e "${YELLOW}📝 Logs are available in the logs/ directory${NC}"
echo -e "${YELLOW}🛑 Press Ctrl+C to stop all services${NC}"
echo "============================="

cleanup() {
    cleanup_apps "$APPS_DIR"
    echo -e "${BLUE}🐳 Stopping Docker services...${NC}"
    docker-compose down
    echo -e "${GREEN}👋 MakrX Ecosystem stopped successfully${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
