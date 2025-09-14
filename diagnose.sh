#!/bin/bash

echo "🔍 MakrX Ecosystem Diagnostics"
echo "=============================="

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

echo "System Info:"
echo "  OS: $(uname -s)"
echo "  Node: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "  npm: $(npm --version 2>/dev/null || echo 'NOT FOUND')"  
echo "  Python3: $(python3.12 --version 2>/dev/null || echo 'NOT FOUND')"
echo "  Docker: $(docker --version 2>/dev/null | head -1 || echo 'NOT FOUND')"

echo ""
echo "Project Structure:"
echo "  Frontend apps: $(ls apps/ 2>/dev/null | wc -l)"
echo "  Backend services: $(ls backends/ 2>/dev/null | wc -l)"
echo "  Shared packages: $(ls packages/ 2>/dev/null | wc -l)"

echo ""
echo "Dependencies Status:"
for app in apps/*/; do
    app_name=$(basename "$app")
    if [ -d "$app/node_modules" ]; then
        package_count=$(find "$app/node_modules" -maxdepth 1 -type d | wc -l)
        echo "  ✅ $app_name ($package_count packages)"
    else
        echo "  ❌ $app_name (no node_modules)"
    fi
done

echo ""
echo "Port Usage:"
for port in 3000 3001 3002 3003 3004 5432 6379 8080; do
    if command -v lsof >/dev/null 2>&1; then
        if lsof -i :$port >/dev/null 2>&1; then
            process=$(lsof -t -i :$port 2>/dev/null | head -1)
            echo "  🔴 Port $port: BUSY (PID: $process)"
        else
            echo "  🟢 Port $port: FREE"
        fi
    else
        echo "  ❓ Port $port: Cannot check (lsof not available)"
    fi
done

echo ""
echo "Docker Status:"
if command -v docker >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
        echo "  ✅ Docker daemon is running"
        running_containers=$(docker ps --format "table {{.Names}}" | grep -v NAMES | wc -l)
        echo "  🐳 Running containers: $running_containers"
    else
        echo "  ❌ Docker daemon is not running"
    fi
else
    echo "  ❌ Docker not installed"
fi

echo ""
echo "Quick Fix Suggestions:"
echo "  📦 Install all deps: npm ci --legacy-peer-deps"
echo "  🐳 Start infrastructure: docker-compose up -d"
echo "  🧪 Test single app: ./test-single-app.sh"
echo "  🚀 Full start: ./start.sh"