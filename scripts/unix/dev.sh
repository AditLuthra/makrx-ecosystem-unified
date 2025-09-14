#!/bin/bash

set -e

echo "🚀 Starting MakrX Ecosystem development environment..."

# Start infrastructure services
echo "🐳 Starting infrastructure services with Docker..."
docker-compose up -d postgres redis keycloak minio

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Function to start a service in background
start_service() {
    local name=$1
    local path=$2
    local port=$3
    
    echo "🚀 Starting $name on port $port..."
    cd "$path"
    npm run dev &
    cd - > /dev/null
}

# Start all development servers
start_service "Gateway Frontend" "apps/gateway-frontend" 3000
start_service "Gateway Hacker" "apps/gateway-frontend-hacker" 3001
start_service "MakrCave Frontend" "apps/makrcave" 3002
start_service "MakrX Store" "apps/makrx-store" 3003
start_service "MakrX Events" "apps/makrx-events" 3004

echo ""
echo "✅ Development environment started!"
echo "   🌐 Services will be available at:"
echo "   - Gateway Frontend: http://localhost:3000"
echo "   - Gateway Hacker: http://localhost:3001"  
echo "   - MakrCave: http://localhost:3002"
echo "   - MakrX Store: http://localhost:3003"
echo "   - MakrX Events: http://localhost:3004"
echo ""
echo "   🛑 To stop all services: npm run stop"
