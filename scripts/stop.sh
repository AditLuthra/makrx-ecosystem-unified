#!/bin/bash

echo "⏹️ Stopping MakrX Ecosystem"
echo "============================"

# Stop Node.js processes
echo "🛑 Stopping frontend applications..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Stop backend processes
echo "🛑 Stopping backend services..."
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "tsx" 2>/dev/null || true

# Stop Docker containers
echo "🐳 Stopping infrastructure services..."
docker-compose down

echo "✅ MakrX Ecosystem stopped successfully!"
