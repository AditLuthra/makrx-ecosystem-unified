#!/bin/bash
set -e

echo "🚀 Starting MakrX Ecosystem Backends"
echo "===================================="

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

echo -e "${BLUE}🔧 Starting infrastructure services first...${NC}"
docker-compose up -d postgres redis keycloak minio

echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 15

# Check service health
echo -e "${BLUE}📊 Checking service health...${NC}"
docker-compose ps

echo -e "${BLUE}🐍 Starting MakrCave Backend (Python FastAPI)...${NC}"
cd backends/makrcave

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
	echo -e "${YELLOW}Creating Python virtual environment...${NC}"
	python3.12 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -r requirements.txt

# Start backend in background
echo -e "${GREEN}Starting MakrCave backend on port 8001...${NC}"
PORT=8001 python main.py >../../logs/makrcave-backend.log 2>&1 &
MAKRCAVE_BACKEND_PID=$!
echo $MAKRCAVE_BACKEND_PID >../../.makrcave-backend.pid

cd ../..

echo -e "${BLUE}📅 Starting MakrX Events Backend (FastAPI)...${NC}"
cd backends/makrx_events

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
	echo -e "${YELLOW}Creating Python virtual environment...${NC}"
	python3.12 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -r requirements.txt >/dev/null 2>&1 || true

# Start backend in background
echo -e "${GREEN}Starting MakrX Events backend on port 8002...${NC}"
nohup uvicorn main:app --host 0.0.0.0 --port 8002 --reload >../../logs/makrx-events-backend.log 2>&1 &
EVENTS_BACKEND_PID=$!
echo $EVENTS_BACKEND_PID >../../.makrx-events-backend.pid
deactivate

cd ../..

echo -e "${BLUE}🛒 Starting MakrX Store Backend (Python FastAPI)...${NC}"
cd backends/makrx-store

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
	echo -e "${YELLOW}Creating Python virtual environment...${NC}"
	python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -r requirements.txt

# Start backend in background
echo -e "${GREEN}Starting MakrX Store backend on port 8003...${NC}"
PORT=8003 python main.py >../../logs/makrx-store-backend.log 2>&1 &
STORE_BACKEND_PID=$!
echo $STORE_BACKEND_PID >../../.makrx-store-backend.pid

cd ../..

echo ""
echo -e "${GREEN}🎉 Backend Services Started!${NC}"
echo "================================="
echo -e "${BLUE}🔗 Backend URLs:${NC}"
echo "   MakrCave API:          http://localhost:8001"
echo "   MakrX Events API:      http://localhost:8002"
echo "   MakrX Store API:       http://localhost:8003"
echo ""
echo -e "${BLUE}📋 API Documentation:${NC}"
echo "   MakrCave Docs:         http://localhost:8001/docs"
echo "   MakrX Store Docs:      http://localhost:8003/docs"
echo ""
echo -e "${BLUE}🔧 Infrastructure:${NC}"
echo "   PostgreSQL:            localhost:5433"
echo "   Redis:                 localhost:6380"
echo "   Keycloak:              http://localhost:8081"
echo "   MinIO:                 http://localhost:9003"
echo ""
echo -e "${YELLOW}📝 Logs are available in the logs/ directory${NC}"
echo -e "${YELLOW}🛑 Use './stop-backends.sh' to stop all services${NC}"

# Create logs directory if it doesn't exist
mkdir -p logs

echo -e "${GREEN}✅ All backend services are running!${NC}"
