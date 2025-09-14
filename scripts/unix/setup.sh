#!/bin/bash

set -e

echo "🚀 Setting up MakrX Ecosystem on Unix/Linux/macOS..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    echo "Or use a package manager:"
    echo "  macOS: brew install node"
    echo "  Ubuntu: sudo apt install nodejs npm"
    echo "  CentOS: sudo yum install nodejs npm"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Warning: Docker is not installed. Some features may not work."
    echo "Install Docker from https://docs.docker.com/get-docker/"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# Create environment files
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

# Create app-specific env files
for app_dir in apps/*/; do
    if [ -d "$app_dir" ] && [ ! -f "$app_dir.env.local" ]; then
        echo "📝 Creating ${app_dir}.env.local..."
        cat > "${app_dir}.env.local" << EOL
# Environment variables for $(basename "$app_dir")
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_REALM=makrx
EOL
    fi
done

echo ""
echo "✅ Setup complete! Next steps:"
echo "   1. Configure your .env files"
echo "   2. Run: npm run dev"
echo "   3. Or start with Docker: docker-compose up"
