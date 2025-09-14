#!/bin/bash

# Make script executable
chmod +x "$0" 2>/dev/null || true

cd "$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'  
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() { echo -e "${BLUE}$1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_step() { echo -e "${PURPLE}🔧 $1${NC}"; }

echo "🔧 Fixing Grafana Issues"
echo "========================"

cd monitoring

# Step 1: Stop Grafana
print_step "1. Stopping Grafana container..."
docker-compose -f docker-compose.monitoring.yml stop grafana

# Step 2: Remove Grafana container and volume
print_step "2. Cleaning up Grafana..."
docker-compose -f docker-compose.monitoring.yml rm -f grafana

# Step 3: Check if Grafana directories exist and fix permissions
print_step "3. Checking Grafana configuration..."
mkdir -p grafana/provisioning/datasources
mkdir -p grafana/provisioning/dashboards
mkdir -p grafana/dashboards

# Create datasources provisioning if missing
if [ ! -f "grafana/provisioning/datasources.yml" ]; then
    print_status "Creating Grafana datasources configuration..."
    cat > grafana/provisioning/datasources.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    
  - name: Jaeger
    type: jaeger
    access: proxy
    url: http://jaeger:16686
EOF
    print_success "Created datasources.yml"
fi

# Create dashboards provisioning if missing
if [ ! -f "grafana/provisioning/dashboards.yml" ]; then
    print_status "Creating Grafana dashboards configuration..."
    cat > grafana/provisioning/dashboards.yml << 'EOF'
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
EOF
    print_success "Created dashboards.yml"
fi

# Step 4: Start Grafana with fresh container
print_step "4. Starting Grafana with fresh configuration..."
docker-compose -f docker-compose.monitoring.yml up -d grafana

# Step 5: Wait and check
print_step "5. Waiting for Grafana to initialize..."
sleep 30

# Check if it's working
print_step "6. Testing Grafana..."
for i in {1..6}; do
    if curl -f http://localhost:3005/api/health > /dev/null 2>&1; then
        print_success "🎉 Grafana is now accessible at http://localhost:3005"
        echo ""
        print_status "📊 Grafana Access:"
        echo "  URL: http://localhost:3005"
        echo "  Username: admin"
        echo "  Password: makrx_grafana_admin"
        echo ""
        print_status "🎯 Next steps:"
        echo "1. Open http://localhost:3005"
        echo "2. Login with admin/makrx_grafana_admin"
        echo "3. Check that Prometheus datasource is working"
        echo "4. Import dashboards or create your own"
        exit 0
    else
        echo "Attempt $i/6: Grafana not ready yet, waiting..."
        sleep 10
    fi
done

print_error "Grafana still not accessible. Let's check what's wrong..."

# Show detailed status
print_status "Container status:"
docker-compose -f docker-compose.monitoring.yml ps grafana

print_status "Recent logs:"
docker-compose -f docker-compose.monitoring.yml logs --tail=50 grafana

print_status "🔧 Manual troubleshooting:"
echo "1. Check logs: docker-compose -f docker-compose.monitoring.yml logs grafana"
echo "2. Try different port: edit docker-compose.monitoring.yml, change '3005:3000' to '3006:3000'"
echo "3. Check port conflicts: sudo lsof -i :3005"
echo "4. Full restart: docker-compose -f docker-compose.monitoring.yml down && docker-compose -f docker-compose.monitoring.yml up -d"

cd ..