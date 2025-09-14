#!/bin/bash

echo "🚀 MakrX Ecosystem Full Startup"
echo "==============================="

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

# Check system requirements
echo "🔍 Checking system requirements..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed."
    exit 1
fi

# Stop any existing processes
echo "⏹️ Stopping existing processes..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true

# Stop and clean Docker containers
echo "🐳 Resetting infrastructure..."
docker-compose down
docker-compose up -d postgres redis minio

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Start Keycloak after PostgreSQL is stable
echo "🔐 Starting Keycloak..."
docker-compose up -d keycloak

# Additional wait for services
echo "⏳ Waiting for all services to be ready..."
sleep 15

# Start applications
echo "📱 Starting MakrX Ecosystem..."
echo ""
echo "🌐 Applications will be available at:"
echo "   - Gateway Frontend: http://localhost:3000"
echo "   - MakrCave: http://localhost:3002"
echo "   - MakrX Store: http://localhost:3003"
echo "   - MakrX Events: http://localhost:3004"
echo "   - MinIO Console: http://localhost:9001"
echo ""

# Start all frontend applications
concurrently \
  --prefix-colors "cyan,magenta,yellow,green" \
  --prefix "{name}" \
  --names "gateway,makrcave,events,store" \
  "cd apps/gateway-frontend && npm run dev" \
  "cd apps/makrcave && npm run dev" \
  "cd apps/makrx-events && npm run dev" \
  "cd apps/makrx-store && npm run dev"