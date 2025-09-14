#!/bin/bash

echo "🧪 Testing Single MakrX Application"
echo "==================================="

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

# Test MakrCave as it had the least errors
echo "📱 Testing MakrCave application..."

cd apps/makrcave

# Check if dependencies exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting MakrCave on port 3002..."
echo "🌐 Will be available at: http://localhost:3002"
echo "⏹️  Press Ctrl+C to stop"

# Start with environment override to avoid conflicts
PORT=3002 npm run dev