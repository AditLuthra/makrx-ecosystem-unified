#!/bin/bash

echo "🚀 Starting MakrX Ecosystem (Simple Mode)"
echo "========================================"

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

# Start infrastructure first (skip Keycloak to avoid auth issues)
echo "🐳 Starting infrastructure services..."
docker-compose up -d postgres redis minio

# Wait for infrastructure to be ready
echo "⏳ Waiting for infrastructure to be ready..."
sleep 10

# Start frontend apps only
echo "📱 Starting frontend applications..."

# Use npm workspaces to start individual apps
concurrently \
	--prefix-colors "cyan,magenta,yellow,green" \
	--prefix "{name}" \
	--names "gateway,makrcave,events,store" \
	"cd apps/gateway-frontend && npm run dev" \
	"cd apps/makrcave && npm run dev" \
	"cd apps/makrx-events && npm run dev" \
	"cd apps/makrx-store && npm run dev"
