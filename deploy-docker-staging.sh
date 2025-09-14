#!/bin/bash

set -e

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
print_step() { echo -e "${PURPLE}🚀 $1${NC}"; }

echo "🚀 MakrX Ecosystem - Docker Staging Deployment"
echo "=============================================="
echo "Environment: staging"
echo "Method: Docker Compose (simulating Kubernetes)"
echo ""

# Check prerequisites
print_step "Checking prerequisites..."

if ! command -v docker &>/dev/null; then
	print_error "Docker is not installed"
	exit 1
fi

print_success "Docker is available"

# Create staging-specific docker-compose
print_step "Creating staging deployment configuration..."

cat >docker-compose.staging.yml <<'EOF'
version: '3.8'

services:
  # Infrastructure services (same as development but with staging config)
  postgres-staging:
    image: postgres:15-alpine
    container_name: makrx-staging-postgres
    environment:
      POSTGRES_DB: makrx_staging
      POSTGRES_USER: makrx_staging
      POSTGRES_PASSWORD: makrx_staging_password
    ports:
      - '5434:5432'
    volumes:
      - postgres_staging_data:/var/lib/postgresql/data
      - ./services/postgres/init-scripts:/docker-entrypoint-initdb.d
    networks:
      - makrx-staging-network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U makrx_staging -d makrx_staging']
      interval: 30s
      timeout: 10s
      retries: 3

  redis-staging:
    image: redis:7-alpine
    container_name: makrx-staging-redis
    ports:
      - '6381:6379'
    volumes:
      - redis_staging_data:/data
    networks:
      - makrx-staging-network
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 30s
      timeout: 10s
      retries: 3

  minio-staging:
    image: minio/minio:latest
    container_name: makrx-staging-minio
    ports:
      - '9004:9000'
      - '9005:9001'
    environment:
      MINIO_ROOT_USER: makrxstaging
      MINIO_ROOT_PASSWORD: makrxstaging123
    volumes:
      - minio_staging_data:/data
    networks:
      - makrx-staging-network
    command: server /data --console-address ":9001"
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live']
      interval: 30s
      timeout: 10s
      retries: 3

  keycloak-staging:
    image: quay.io/keycloak/keycloak:25.0
    container_name: makrx-staging-keycloak
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: staging123
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres-staging:5432/makrx_staging
      KC_DB_USERNAME: makrx_staging
      KC_DB_PASSWORD: makrx_staging_password
      KC_HOSTNAME_STRICT: "false"
      KC_HTTP_ENABLED: "true"
      KC_HOSTNAME_STRICT_HTTPS: "false"
    ports:
      - '8082:8080'
    depends_on:
      postgres-staging:
        condition: service_healthy
    networks:
      - makrx-staging-network
    volumes:
      - ./services/keycloak/realm-config:/opt/keycloak/data/import
    command: ['start-dev', '--import-realm']
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8080/health/ready']
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 60s

  # Monitoring for staging
  prometheus-staging:
    image: prom/prometheus:latest
    container_name: makrx-staging-prometheus
    ports:
      - '9091:9090'
    volumes:
      - ./monitoring/prometheus:/etc/prometheus
      - prometheus_staging_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - makrx-staging-network

networks:
  makrx-staging-network:
    driver: bridge

volumes:
  postgres_staging_data:
    driver: local
  redis_staging_data:
    driver: local
  minio_staging_data:
    driver: local
  prometheus_staging_data:
    driver: local
EOF

print_success "Staging configuration created"

# Stop any existing staging containers
print_step "Stopping existing staging containers..."
docker-compose -f docker-compose.staging.yml down 2>/dev/null || true

# Start staging infrastructure
print_step "Starting staging infrastructure..."
docker-compose -f docker-compose.staging.yml up -d postgres-staging redis-staging minio-staging

print_status "Waiting for infrastructure to be ready..."
sleep 15

# Check infrastructure health
print_step "Checking infrastructure health..."

# Check PostgreSQL
if docker-compose -f docker-compose.staging.yml exec -T postgres-staging pg_isready -U makrx_staging -d makrx_staging >/dev/null 2>&1; then
	print_success "✅ Staging PostgreSQL: Ready"
else
	print_warning "⚠️  Staging PostgreSQL: Not ready yet"
fi

# Check Redis
if docker-compose -f docker-compose.staging.yml exec -T redis-staging redis-cli ping 2>/dev/null | grep -q PONG; then
	print_success "✅ Staging Redis: Ready"
else
	print_warning "⚠️  Staging Redis: Not ready yet"
fi

# Check MinIO
if curl -f http://localhost:9004/minio/health/live >/dev/null 2>&1; then
	print_success "✅ Staging MinIO: Ready"
else
	print_warning "⚠️  Staging MinIO: Not ready yet"
fi

# Start Keycloak
print_step "Starting Keycloak (this takes a moment)..."
docker-compose -f docker-compose.staging.yml up -d keycloak-staging

# Start monitoring
print_step "Starting staging monitoring..."
docker-compose -f docker-compose.staging.yml up -d prometheus-staging

print_step "Waiting for all services to stabilize..."
sleep 30

# Final status check
print_step "Final staging deployment status..."

echo ""
print_status "🎯 Staging Services Status:"
docker-compose -f docker-compose.staging.yml ps

echo ""
print_status "📊 Staging Environment Access:"
echo "  PostgreSQL: localhost:5434"
echo "  Redis: localhost:6381"
echo "  MinIO: http://localhost:9004"
echo "  MinIO Console: http://localhost:9005"
echo "  Keycloak: http://localhost:8082"
echo "  Prometheus: http://localhost:9091"

echo ""
print_success "🎉 Staging deployment simulation complete!"

echo ""
print_status "🔧 Next steps:"
echo "1. Test staging connectivity:"
echo "   curl http://localhost:9004/minio/health/live"
echo "   curl http://localhost:8082/health/ready"
echo ""
echo "2. Run staging validation:"
echo "   python3.12 -c \"import requests; print('MinIO:', requests.get('http://localhost:9004/minio/health/live').status_code)\""
echo ""
echo "3. Access staging monitoring:"
echo "   open http://localhost:9091"
echo ""
echo "4. Stop staging environment:"
echo "   docker-compose -f docker-compose.staging.yml down"
echo ""

# Create staging validation script
cat >validate-staging.sh <<'EOF'
#!/bin/bash

echo "🧪 Validating Staging Environment"
echo "================================="

# Test MinIO
if curl -f http://localhost:9004/minio/health/live > /dev/null 2>&1; then
    echo "✅ MinIO staging is healthy"
else
    echo "❌ MinIO staging failed"
fi

# Test Keycloak
if curl -f http://localhost:8082/health/ready > /dev/null 2>&1; then
    echo "✅ Keycloak staging is healthy"
else
    echo "⚠️  Keycloak staging not ready (may still be starting)"
fi

# Test Prometheus
if curl -f http://localhost:9091/-/healthy > /dev/null 2>&1; then
    echo "✅ Prometheus staging is healthy"
else
    echo "⚠️  Prometheus staging not ready"
fi

echo ""
echo "🎯 Staging validation complete!"
EOF

chmod +x validate-staging.sh
print_success "Created staging validation script: ./validate-staging.sh"

exit 0
