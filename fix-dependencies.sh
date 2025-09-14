#!/bin/bash

echo "🔧 Fixing MakrX Ecosystem Dependencies..."

# Stop any running processes
echo "⏹️ Stopping existing processes..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "tsx" 2>/dev/null || true

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps

# Install individual app dependencies
echo "📱 Installing frontend app dependencies..."

# Gateway Frontend
cd apps/gateway-frontend
npm install @tailwindcss/typography critters --legacy-peer-deps
cd ../..

# Gateway Frontend Hacker  
cd apps/gateway-frontend-hacker
npm install @tanstack/react-query react-helmet-async react-router-dom @types/node --legacy-peer-deps
cd ../..

# MakrCave
cd apps/makrcave
npm install --legacy-peer-deps
cd ../..

# MakrX Events
cd apps/makrx-events  
npm install --legacy-peer-deps
cd ../..

# MakrX Store
cd apps/makrx-store
npm install --legacy-peer-deps
cd ../..

# Install backend dependencies
echo "🖥️ Installing backend dependencies..."

# MakrX Events Backend
cd backends/makrx_events
npm install cors @types/cors --legacy-peer-deps
cd ../..

# Install Python dependencies (if pip3 is available)
if command -v pip3 &> /dev/null; then
    echo "🐍 Installing Python dependencies..."
    
    cd backends/makrcave
    if [ -f requirements.txt ]; then
        pip3 install -r requirements.txt --user
    fi
    cd ../..
    
    cd backends/makrx-store  
    if [ -f requirements.txt ]; then
        pip3 install -r requirements.txt --user
    fi
    cd ../..
fi

echo "✅ Dependencies installation complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm run dev"
echo "   2. Check http://localhost:3000 (Gateway Frontend)"
echo "   3. Check http://localhost:3001 (Gateway Frontend Hacker)" 
echo "   4. Check http://localhost:3002 (MakrCave)"
echo "   5. Check http://localhost:3003 (MakrX Store)"
echo "   6. Check http://localhost:3004 (MakrX Events)"
