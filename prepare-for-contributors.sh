#!/bin/bash

# MakrX Ecosystem - Contributor Preparation Script
# Sets up the repository for GitHub and cross-platform development

set -e

echo "🚀 PREPARING MAKRX ECOSYSTEM FOR CONTRIBUTORS"
echo "============================================="

# Create cross-platform scripts directory
mkdir -p scripts/windows
mkdir -p scripts/unix
mkdir -p scripts/shared

# Create comprehensive .gitignore
echo "📝 Creating comprehensive .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
.next/
dist/
build/
out/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/
.pytest_cache/
.coverage
htmlcov/

# Environment files
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# ESLint cache
.eslintcache

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/
.tmp/

# Editor directories and files
.vscode/
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Docker
.dockerignore

# Database
*.db
*.sqlite

# Test results
test-results/
ci-results/

# Deployment
deploy-key*
*.pem

# Local development
.env.local
docker-compose.override.yml
EOF

echo "✅ Created comprehensive .gitignore"

echo "🔧 Setting up cross-platform scripts..."

# Create Windows batch files
cat > scripts/windows/setup.bat << 'EOF'
@echo off
echo Setting up MakrX Ecosystem on Windows...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Docker is not installed. Some features may not work.
    echo Install Docker Desktop from https://www.docker.com/products/docker-desktop
)

:: Install dependencies
echo Installing dependencies...
npm ci --legacy-peer-deps

:: Create environment files
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

:: Create app-specific env files
for /d %%i in (apps\*) do (
    if not exist "%%i\.env.local" (
        echo Creating %%i\.env.local...
        echo # Environment variables for %%i > "%%i\.env.local"
        echo NEXT_PUBLIC_API_URL=http://localhost:3000/api >> "%%i\.env.local"
        echo NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081 >> "%%i\.env.local"
        echo NEXT_PUBLIC_KEYCLOAK_REALM=makrx >> "%%i\.env.local"
    )
)

echo.
echo ✅ Setup complete! Next steps:
echo    1. Configure your .env files
echo    2. Run: npm run dev
echo    3. Or start with Docker: docker-compose up
EOF

# Create Windows development script
cat > scripts/windows/dev.bat << 'EOF'
@echo off
echo Starting MakrX Ecosystem development environment...

:: Start infrastructure services
echo Starting infrastructure services with Docker...
docker-compose up -d postgres redis keycloak minio

:: Wait a moment for services to start
timeout /t 10 /nobreak > nul

:: Start all development servers
echo Starting development servers...
start "Gateway Frontend" cmd /k "cd apps\gateway-frontend && npm run dev"
start "Gateway Hacker" cmd /k "cd apps\gateway-frontend-hacker && npm run dev"
start "MakrCave Frontend" cmd /k "cd apps\makrcave && npm run dev"
start "MakrX Store" cmd /k "cd apps\makrx-store && npm run dev"
start "MakrX Events" cmd /k "cd apps\makrx-events && npm run dev"

echo.
echo ✅ Development environment started!
echo    - Infrastructure services running in Docker
echo    - Frontend apps starting in separate windows
echo    - Check each window for startup status
EOF

# Create Unix setup script
cat > scripts/unix/setup.sh << 'EOF'
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
EOF

# Create Unix development script
cat > scripts/unix/dev.sh << 'EOF'
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
EOF

# Make Unix scripts executable
chmod +x scripts/unix/setup.sh
chmod +x scripts/unix/dev.sh

echo "✅ Created cross-platform scripts"

echo "📚 Creating comprehensive documentation..."
echo "   - This will be handled in the next step"

echo ""
echo "🎯 Next steps:"
echo "   1. Run documentation setup"
echo "   2. Test cross-platform compatibility"
echo "   3. Set up GitHub Actions"
echo "   4. Create contributor guides"