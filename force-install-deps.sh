#!/bin/bash

echo "🔧 Force Installing MakrX Dependencies"
echo "====================================="

cd /home/adit/Downloads/MakrX-AI/makrx-ecosystem-unified

# Clean any existing installations first
echo "🧹 Cleaning existing installations..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "package-lock.json" -delete 2>/dev/null || true
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true

# Install root dependencies first
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps

# Install each app individually with full output
echo "📱 Installing individual app dependencies..."

apps=("gateway-frontend" "gateway-frontend-hacker" "makrcave" "makrx-events" "makrx-store")

for app in "${apps[@]}"; do
    if [ -d "apps/$app" ]; then
        echo ""
        echo "🔨 Installing $app..."
        cd "apps/$app"
        
        # Remove any existing node_modules and lockfile
        rm -rf node_modules package-lock.json 2>/dev/null || true
        
        # Install with verbose output
        npm install --legacy-peer-deps --loglevel=info
        
        # Verify installation
        if [ -d "node_modules" ]; then
            count=$(find node_modules -maxdepth 1 -type d | wc -l)
            echo "✅ $app installed successfully ($count packages)"
        else
            echo "❌ $app installation failed"
        fi
        
        cd ../..
    else
        echo "⚠️  Directory apps/$app not found"
    fi
done

echo ""
echo "🔍 Final verification..."
./diagnose.sh

echo ""
echo "✅ Installation complete! Try running:"
echo "   npm run test-single"