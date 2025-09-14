#!/bin/bash
# Start script for MakrX Services Platform

echo "🚀 Starting MakrX Services Platform..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
	echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
	echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
	echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
	echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &>/dev/null; then
	print_error "Node.js is not installed. Please install Node.js 18+ first."
	exit 1
fi

# Check if Python is installed
if ! command -v python3.12 &>/dev/null && ! command -v python &>/dev/null; then
	print_error "Python is not installed. Please install Python 3.8+ first."
	exit 1
fi

# Set up environment
print_status "Setting up environment..."

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
	print_status "Creating .env.local from template..."
	cp ../.env.example .env.local 2>/dev/null || cp .env.example .env.local 2>/dev/null || {
		print_warning ".env.example not found, creating basic .env.local"
		cat >.env.local <<EOF
# MakrX Services Environment Configuration
NEXT_PUBLIC_SERVICES_API_URL=http://localhost:8006/api
NEXT_PUBLIC_STORE_API_URL=http://localhost:8004/api
NEXT_PUBLIC_SERVICES_URL=http://localhost:3005
NEXT_PUBLIC_STORE_URL=http://localhost:3001

# Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_REALM=makrx
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=makrx-services

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.stl,.obj,.3mf,.svg,.dxf,.png,.jpg,.jpeg
EOF
	}
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
	print_status "Installing dependencies..."
	npm install
	if [ $? -ne 0 ]; then
		print_error "Failed to install dependencies"
		exit 1
	fi
	print_success "Dependencies installed successfully"
else
	print_status "Dependencies already installed"
fi

# Check if backend is required
if [ "${1}" = "--with-backend" ] || [ "${1}" = "-b" ]; then
	print_status "Starting with backend service..."

	# Check if backend directory exists
	if [ ! -d "../../backends/makrx-services" ]; then
		print_error "Backend directory not found at ../../backends/makrx-services"
		exit 1
	fi

	# Setup Python virtual environment for backend
	cd ../../backends/makrx-services

	if [ ! -d ".venv" ]; then
		print_status "Creating Python virtual environment..."
		python3.12 -m venv .venv
		if [ $? -ne 0 ]; then
			print_error "Failed to create virtual environment"
			exit 1
		fi
	fi

	# Activate virtual environment
	source .venv/bin/activate

	# Install Python dependencies
	if [ ! -f ".venv/pip-installed" ]; then
		print_status "Installing Python dependencies..."
		pip install -r requirements.txt
		if [ $? -ne 0 ]; then
			print_error "Failed to install Python dependencies"
			exit 1
		fi
		touch .venv/pip-installed
		print_success "Python dependencies installed"
	fi

	# Start backend in background
	print_status "Starting services backend on port 8006..."
	python -m app.main &
	BACKEND_PID=$!

	# Return to frontend directory
	cd ../../apps/makrx-services

	# Wait for backend to start
	sleep 3

	# Check if backend is running
	if curl -s http://localhost:8006/health >/dev/null 2>&1; then
		print_success "Services backend started successfully"
	else
		print_warning "Backend may still be starting..."
	fi
fi

# Start the frontend development server
print_status "Starting Next.js development server on port 3005..."

# Check if port 3005 is already in use
if netstat -tuln | grep -q ":3005 "; then
	print_warning "Port 3005 is already in use"
	print_status "Attempting to find available port..."

	# Try to find an available port
	for port in 3006 3007 3008 3009; do
		if ! netstat -tuln | grep -q ":${port} "; then
			print_status "Using port ${port} instead"
			export PORT=${port}
			break
		fi
	done
fi

# Create startup information
print_success "🎉 MakrX Services Platform is starting..."
echo ""
echo "📋 Service Information:"
echo "   • Frontend URL: http://localhost:${PORT:-3005}"
echo "   • API URL: http://localhost:8006 (if backend started)"
echo "   • Platform: services.makrx.store (production)"
echo ""
echo "🔧 Available Services:"
echo "   • 3D Printing Services"
echo "   • Laser Engraving Services"
echo "   • Provider Dashboard"
echo "   • Cross-platform Order Management"
echo ""
echo "📖 Quick Links:"
echo "   • Homepage: /"
echo "   • 3D Printing: /3d-printing"
echo "   • Laser Engraving: /laser-engraving"
echo "   • Provider Dashboard: /provider-dashboard"
echo "   • Orders: /orders"
echo ""

# Function to cleanup on exit
cleanup() {
	print_status "Shutting down services..."
	if [ ! -z "$BACKEND_PID" ]; then
		kill $BACKEND_PID 2>/dev/null
		print_success "Backend stopped"
	fi
	exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

# Start the development server
if [ "${NODE_ENV}" = "production" ]; then
	print_status "Starting in production mode..."
	npm run build && npm start
else
	print_status "Starting in development mode..."
	npm run dev
fi
