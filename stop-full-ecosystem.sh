#!/bin/bash

cd "$(dirname "$0")"

echo "🛑 Stopping MakrX Full Ecosystem"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop process by PID file
stop_by_pid_file() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "Stopping $service_name (PID: $pid)..."
            kill $pid
            sleep 2
            
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                echo "Force stopping $service_name..."
                kill -9 $pid
            fi
            
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name was not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}⚠️  No PID file found for $service_name${NC}"
    fi
}

echo -e "${BLUE}🎨 Stopping Frontend Applications${NC}"

# Stop frontend applications
apps=("gateway-frontend" "gateway-frontend-hacker" "makrcave" "makrx-store" "makrx-events")

for app in "${apps[@]}"; do
    stop_by_pid_file ".$app.pid" "$app"
done

# Additional cleanup for Next.js processes
echo "Cleaning up any remaining Next.js processes..."
pkill -f "next dev" || true
pkill -f "npm run dev" || true

echo -e "${BLUE}🔧 Stopping Backend Services${NC}"

# Stop backend services
stop_by_pid_file ".makrcave-backend.pid" "MakrCave Backend"
stop_by_pid_file ".makrx-events-backend.pid" "MakrX Events Backend"
stop_by_pid_file ".makrx-store-backend.pid" "MakrX Store Backend"

# Additional cleanup for backend processes
echo "Cleaning up any remaining backend processes..."
pkill -f "uvicorn" || true
pkill -f "fastapi" || true
pkill -f "node.*server" || true

echo -e "${BLUE}🐳 Stopping Infrastructure Services${NC}"

# Stop Docker services
docker-compose down

# Clean up any remaining containers
echo "Cleaning up any remaining containers..."
docker ps -q --filter "name=makrx-" | xargs -r docker stop
docker ps -aq --filter "name=makrx-" | xargs -r docker rm

echo -e "${BLUE}🧹 Cleaning up${NC}"

# Clean up log files if they exist
if [ -d "logs" ]; then
    echo "Log files preserved in logs/ directory"
fi

# Clean up any remaining PID files
rm -f .*.pid

echo ""
echo -e "${GREEN}✅ MakrX Ecosystem Stopped Successfully!${NC}"
echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo "  - Log files are preserved in logs/ directory"
echo "  - Docker volumes are preserved (use 'docker-compose down -v' to remove)"
echo "  - To restart: ./start-full-ecosystem.sh"
echo ""