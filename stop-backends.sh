#!/bin/bash

echo "🛑 Stopping MakrX Ecosystem Backends"
echo "===================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Stop backend processes
if [ -f ".makrcave-backend.pid" ]; then
	echo -e "${BLUE}Stopping MakrCave backend...${NC}"
	pid=$(cat ".makrcave-backend.pid")
	if kill -0 $pid 2>/dev/null; then
		kill $pid
	fi
	rm -f ".makrcave-backend.pid"
fi

if [ -f ".makrx-events-backend.pid" ]; then
	echo -e "${BLUE}Stopping MakrX Events backend...${NC}"
	pid=$(cat ".makrx-events-backend.pid")
	if kill -0 $pid 2>/dev/null; then
		kill $pid
	fi
	rm -f ".makrx-events-backend.pid"
fi

if [ -f ".makrx-store-backend.pid" ]; then
	echo -e "${BLUE}Stopping MakrX Store backend...${NC}"
	pid=$(cat ".makrx-store-backend.pid")
	if kill -0 $pid 2>/dev/null; then
		kill $pid
	fi
	rm -f ".makrx-store-backend.pid"
fi

# Stop Docker services
echo -e "${BLUE}🐳 Stopping Docker services...${NC}"
docker-compose down

echo -e "${GREEN}✅ All backend services stopped!${NC}"
