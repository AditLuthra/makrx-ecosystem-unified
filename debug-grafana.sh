#!/bin/bash

# Make script executable
chmod +x "$0" 2>/dev/null || true

cd "$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'  
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}$1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo "🔍 Debugging Grafana Issue"
echo "========================="

# Check if monitoring directory exists
print_status "1. Checking monitoring setup..."
if [ -d "monitoring" ]; then
    print_success "Monitoring directory exists"
else
    print_error "Monitoring directory missing"
    exit 1
fi

# Check if docker-compose file exists
print_status "2. Checking monitoring docker-compose file..."
if [ -f "monitoring/docker-compose.monitoring.yml" ]; then
    print_success "Monitoring docker-compose file exists"
else
    print_error "monitoring/docker-compose.monitoring.yml not found"
    exit 1
fi

# Check container status
print_status "3. Checking monitoring containers..."
cd monitoring

# Show all monitoring containers
echo "All monitoring containers:"
docker-compose -f docker-compose.monitoring.yml ps

# Check Grafana specifically
print_status "4. Checking Grafana container status..."
grafana_status=$(docker-compose -f docker-compose.monitoring.yml ps grafana | grep grafana | awk '{print $4}')
if [ "$grafana_status" = "Up" ]; then
    print_success "Grafana container is running"
else
    print_error "Grafana container status: $grafana_status"
    
    print_status "Grafana container logs (last 20 lines):"
    docker-compose -f docker-compose.monitoring.yml logs --tail=20 grafana
    
    print_status "Attempting to restart Grafana..."
    docker-compose -f docker-compose.monitoring.yml restart grafana
    
    print_status "Waiting for Grafana to restart..."
    sleep 15
fi

# Check if Grafana port is accessible
print_status "5. Testing Grafana connectivity..."
if curl -f http://localhost:3005 > /dev/null 2>&1; then
    print_success "Grafana is accessible at http://localhost:3005"
else
    print_warning "Grafana not accessible yet. Checking what's on port 3005..."
    netstat -tlnp 2>/dev/null | grep :3005 || echo "Nothing listening on port 3005"
fi

# Check Prometheus for comparison
print_status "6. Checking Prometheus (for comparison)..."
if curl -f http://localhost:9090 > /dev/null 2>&1; then
    print_success "Prometheus is accessible at http://localhost:9090"
else
    print_warning "Prometheus also not accessible"
fi

# Check if port 3005 is conflicting
print_status "7. Checking for port conflicts..."
port_check=$(netstat -tlnp 2>/dev/null | grep :3005)
if [ -n "$port_check" ]; then
    echo "Port 3005 usage:"
    echo "$port_check"
else
    print_warning "Port 3005 appears to be free"
fi

# Check Docker logs for Grafana
print_status "8. Recent Grafana logs..."
docker-compose -f docker-compose.monitoring.yml logs --tail=30 grafana

echo ""
print_status "🔧 Troubleshooting suggestions:"
echo ""
echo "1. Wait longer (Grafana can take 30-60 seconds to start):"
echo "   sleep 60 && curl http://localhost:3005"
echo ""
echo "2. Restart Grafana:"
echo "   docker-compose -f docker-compose.monitoring.yml restart grafana"
echo ""
echo "3. Check if port 3005 is being used by something else:"
echo "   sudo lsof -i :3005"
echo ""
echo "4. Try accessing Grafana with different port:"
echo "   docker-compose -f docker-compose.monitoring.yml down"
echo "   # Edit docker-compose.monitoring.yml to use port 3006"
echo "   docker-compose -f docker-compose.monitoring.yml up -d"
echo ""
echo "5. Full restart of monitoring stack:"
echo "   docker-compose -f docker-compose.monitoring.yml down"
echo "   docker-compose -f docker-compose.monitoring.yml up -d"
echo ""
echo "6. Check Grafana health endpoint:"
echo "   curl -v http://localhost:3005/api/health"
echo ""

cd ..