#!/bin/bash

echo "🔍 MakrX Ecosystem Status Check"
echo "==============================="

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

echo "📋 System Requirements:"
echo "  Python3: $(which python3.12 2>/dev/null || echo '❌ NOT FOUND')"
echo "  Node.js: $(node --version 2>/dev/null || echo '❌ NOT FOUND')"
echo "  npm: $(npm --version 2>/dev/null || echo '❌ NOT FOUND')"
echo "  Docker: $(docker --version 2>/dev/null || echo '❌ NOT FOUND')"

echo ""
echo "📦 Frontend Apps Dependencies:"
for app in gateway-frontend makrcave makrx-events makrx-store; do
    if [ -d "apps/$app/node_modules" ]; then
        echo "  ✅ apps/$app"
    else
        echo "  ❌ apps/$app - missing node_modules"
    fi
done

echo ""
echo "🐳 Docker Containers:"
docker-compose ps 2>/dev/null || echo "  ❌ Docker Compose not running"

echo ""
echo "🔌 Port Status:"
for port in 3000 3001 3002 3003 3004 8001 8002 8003; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo "  🟢 Port $port: IN USE"
    else
        echo "  ⚪ Port $port: FREE"
    fi
done

echo ""
echo "📝 Recommendations:"
if [ ! -d "apps/gateway-frontend/node_modules" ]; then
    echo "  🔧 Run: npm ci --legacy-peer-deps"
fi
if ! docker-compose ps >/dev/null 2>&1; then
    echo "  🐳 Run: docker-compose up -d"
fi