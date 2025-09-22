#!/bin/bash

echo "🧪 Validating Staging Environment"
echo "================================="

# Test MinIO
if curl -f http://localhost:9004/minio/health/live >/dev/null 2>&1; then
	echo "✅ MinIO staging is healthy"
else
	echo "❌ MinIO staging failed"
fi

# Test Keycloak
if curl -f http://localhost:8082/health/ready >/dev/null 2>&1; then
	echo "✅ Keycloak staging is healthy"
else
	echo "⚠️  Keycloak staging not ready (may still be starting)"
fi

# Test Prometheus
if curl -f http://localhost:9091/-/healthy >/dev/null 2>&1; then
	echo "✅ Prometheus staging is healthy"
else
	echo "⚠️  Prometheus staging not ready"
fi

echo ""
echo "🎯 Staging validation complete!"
