#!/bin/bash

set -e

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

echo "🧪 MakrX Ecosystem - Comprehensive Test Suite"
echo "=============================================="

# Create test output directories
mkdir -p test-results/{unit,integration,e2e,performance,security}
mkdir -p coverage/{frontend,backend,combined}
mkdir -p logs

# Test status tracking
UNIT_TESTS_PASSED=true
INTEGRATION_TESTS_PASSED=true
E2E_TESTS_PASSED=true
SECURITY_TESTS_PASSED=true

# Wait for services to be ready
print_step "Waiting for services to be ready..."
timeout 120 bash -c 'until pg_isready -h postgres-test -p 5432 -U makrx; do sleep 5; done' || {
	print_error "PostgreSQL not ready"
	exit 1
}

timeout 60 bash -c 'until redis-cli -h redis-test -p 6379 ping; do sleep 5; done' || {
	print_error "Redis not ready"
	exit 1
}

timeout 180 bash -c 'until curl -f http://keycloak-test:8080/health/ready; do sleep 10; done' || {
	print_warning "Keycloak not ready - continuing with limited tests"
}

print_success "Services are ready"

# 1. Code Quality Checks
print_step "Running code quality checks..."
{
	echo "=== TypeScript Type Checking ===" >>logs/quality.log
	npm run type-check --workspaces --if-present >>logs/quality.log 2>&1 || echo "Type checking issues found" >>logs/quality.log

	echo "=== ESLint ===" >>logs/quality.log
	npm run lint --workspaces --if-present >>logs/quality.log 2>&1 || echo "Linting issues found" >>logs/quality.log

	echo "=== Prettier Format Check ===" >>logs/quality.log
	npx prettier --check "**/*.{js,jsx,ts,tsx,json,md}" >>logs/quality.log 2>&1 || echo "Formatting issues found" >>logs/quality.log

	echo "=== Python Code Quality ===" >>logs/quality.log
	for backend in backends/*; do
		if [ -d "$backend" ] && [ -f "$backend/requirements.txt" ]; then
			echo "Checking $backend" >>logs/quality.log
			cd "$backend"
			pip3 install -r requirements.txt >>/dev/null 2>&1

			# Linting
			flake8 . --count --statistics >>../logs/quality.log 2>&1 || echo "Flake8 issues in $backend" >>../logs/quality.log

			# Formatting
			black --check . >>../logs/quality.log 2>&1 || echo "Black formatting issues in $backend" >>../logs/quality.log

			# Type checking
			mypy . >>../logs/quality.log 2>&1 || echo "MyPy type issues in $backend" >>../logs/quality.log

			cd ../..
		fi
	done

} && print_success "Code quality checks completed" || print_warning "Code quality issues found - check logs/quality.log"

# 2. Unit Tests - Frontend
print_step "Running frontend unit tests..."
{
	echo "=== Frontend Unit Tests ===" >>logs/unit-tests.log
	for app in apps/*; do
		if [ -d "$app" ] && [ -f "$app/package.json" ]; then
			app_name=$(basename "$app")
			echo "Testing $app_name" >>logs/unit-tests.log
			cd "$app"

			if grep -q '"test"' package.json; then
				npm test -- --coverage --watchAll=false --ci --testResultsProcessor="jest-junit" \
					--coverageDirectory="../../coverage/frontend/$app_name" \
					--testResultsProcessor="../../test-results/unit/frontend-$app_name.xml" \
					>>../../logs/unit-tests.log 2>&1 || {
					echo "Unit tests failed for $app_name" >>../../logs/unit-tests.log
					UNIT_TESTS_PASSED=false
				}
			else
				echo "No tests found for $app_name" >>../../logs/unit-tests.log
			fi

			cd ../..
		fi
	done
} && print_success "Frontend unit tests completed" || print_warning "Some frontend unit tests failed"

# 3. Unit Tests - Backend
print_step "Running backend unit tests..."
{
	echo "=== Backend Unit Tests ===" >>logs/unit-tests.log
	for backend in backends/*; do
		if [ -d "$backend" ] && [ -f "$backend/requirements.txt" ]; then
			backend_name=$(basename "$backend")
			echo "Testing $backend_name" >>logs/unit-tests.log
			cd "$backend"

			pip3 install -r requirements.txt >>/dev/null 2>&1
			pip3 install pytest pytest-cov pytest-asyncio httpx >>/dev/null 2>&1

			# Apply DB migrations when Alembic config is present
			if [ -f "alembic.ini" ]; then
				# Default to local SQLite DB for unit tests if not provided
				export DATABASE_URL=${DATABASE_URL:-sqlite:///./ci_local.db}
				echo "Running Alembic migrations for $backend_name on $DATABASE_URL" >>../../logs/unit-tests.log
				alembic -c alembic.ini upgrade head >>../../logs/unit-tests.log 2>&1 || {
					echo "Alembic migration failed for $backend_name" >>../../logs/unit-tests.log
					UNIT_TESTS_PASSED=false
				}
			fi

			if [ -d "tests/" ] || ls test_*.py >/dev/null 2>&1; then
				pytest -v --tb=short --cov=. --cov-report=xml --cov-report=html \
					--cov-report-dir="../../coverage/backend/$backend_name" \
					--junit-xml="../../test-results/unit/backend-$backend_name.xml" \
					>>../../logs/unit-tests.log 2>&1 || {
					echo "Unit tests failed for $backend_name" >>../../logs/unit-tests.log
					UNIT_TESTS_PASSED=false
				}
			else
				echo "No tests found for $backend_name" >>../../logs/unit-tests.log
			fi

			cd ../..
		fi
	done
} && print_success "Backend unit tests completed" || print_warning "Some backend unit tests failed"

# 4. Integration Tests
print_step "Running integration tests..."
{
	echo "=== Integration Tests ===" >>logs/integration-tests.log

	# Set up test environment
	cat >.env.test <<EOF
NODE_ENV=test
DATABASE_URL=postgresql://makrx:makrx_test_password@postgres-test:5432/makrx_test
REDIS_URL=redis://redis-test:6379
KEYCLOAK_URL=http://keycloak-test:8080
KEYCLOAK_REALM=makrx
MINIO_ENDPOINT=http://minio-test:9000
MINIO_ACCESS_KEY=testuser
MINIO_SECRET_KEY=testpassword123
EOF

	# Run ecosystem integration tests
	python3 final_integration_test.py >>logs/integration-tests.log 2>&1 || {
		echo "Integration tests failed" >>logs/integration-tests.log
		INTEGRATION_TESTS_PASSED=false
	}

	# Run API integration tests if they exist
	if [ -d "tests/integration" ]; then
		pytest tests/integration/ -v --tb=short \
			--junit-xml="test-results/integration/api-tests.xml" \
			>>logs/integration-tests.log 2>&1 || {
			echo "API integration tests failed" >>logs/integration-tests.log
			INTEGRATION_TESTS_PASSED=false
		}
	fi

} && print_success "Integration tests completed" || print_warning "Some integration tests failed"

# 5. End-to-End Tests
print_step "Running end-to-end tests..."
{
	echo "=== E2E Tests ===" >>logs/e2e-tests.log

	if [ -d "tests/e2e" ]; then
		# Install Playwright if not already done
		npx playwright install chromium >>/dev/null 2>&1 || true

		# Run Playwright tests
		npx playwright test --config=tests/e2e/playwright.config.js \
			--reporter=junit --output-dir=test-results/e2e/ \
			>>logs/e2e-tests.log 2>&1 || {
			echo "E2E tests failed" >>logs/e2e-tests.log
			E2E_TESTS_PASSED=false
		}
	else
		echo "No E2E tests found" >>logs/e2e-tests.log
	fi

} && print_success "E2E tests completed" || print_warning "Some E2E tests failed"

# 6. Security Tests
print_step "Running security tests..."
{
	echo "=== Security Tests ===" >>logs/security-tests.log

	# Python security scan
	echo "Python Security Scan:" >>logs/security-tests.log
	for backend in backends/*; do
		if [ -d "$backend" ] && [ -f "$backend/requirements.txt" ]; then
			cd "$backend"
			pip3 install safety bandit >>/dev/null 2>&1

			# Check for known vulnerabilities
			safety check >>../../logs/security-tests.log 2>&1 || echo "Security vulnerabilities found in $backend" >>../../logs/security-tests.log

			# Static security analysis
			bandit -r . -f json -o "../../test-results/security/bandit-$(basename "$backend").json" \
				>>../../logs/security-tests.log 2>&1 || echo "Bandit security issues in $backend" >>../../logs/security-tests.log

			cd ../..
		fi
	done

	# NPM security audit
	echo "NPM Security Audit:" >>logs/security-tests.log
	npm audit --audit-level=moderate --json >test-results/security/npm-audit.json 2>&1 || {
		echo "NPM security vulnerabilities found" >>logs/security-tests.log
		SECURITY_TESTS_PASSED=false
	}

} && print_success "Security tests completed" || print_warning "Security issues found"

# 7. Performance Tests (basic)
print_step "Running performance tests..."
{
	echo "=== Performance Tests ===" >>logs/performance-tests.log

	# Basic load testing with curl
	for port in 3000 3001 3002 3003 3004; do
		echo "Testing port $port" >>logs/performance-tests.log
		timeout 30s bash -c "
            for i in {1..100}; do
                curl -s -o /dev/null -w '%{time_total}\\n' http://localhost:$port/ >> logs/performance-port-$port.log 2>&1 || true
                sleep 0.1
            done
        " || echo "Performance test timeout for port $port" >>logs/performance-tests.log
	done

} && print_success "Performance tests completed" || print_warning "Performance tests had issues"

# 8. Generate Test Reports
print_step "Generating test reports..."
{
	cat >test-results/summary.json <<EOF
{
    "timestamp": "$(date -Iseconds)",
    "environment": "ci",
    "commit": "${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}",
    "branch": "${GITHUB_REF_NAME:-$(git branch --show-current 2>/dev/null || echo 'unknown')}",
    "results": {
        "unit_tests": $([ "$UNIT_TESTS_PASSED" = true ] && echo "true" || echo "false"),
        "integration_tests": $([ "$INTEGRATION_TESTS_PASSED" = true ] && echo "true" || echo "false"),
        "e2e_tests": $([ "$E2E_TESTS_PASSED" = true ] && echo "true" || echo "false"),
        "security_tests": $([ "$SECURITY_TESTS_PASSED" = true ] && echo "true" || echo "false")
    },
    "coverage": {
        "frontend": "$(find coverage/frontend -name 'coverage-summary.json' | head -1 | xargs cat 2>/dev/null | grep -o '"pct":[0-9]*' | head -1 | cut -d: -f2 || echo 0)",
        "backend": "$(find coverage/backend -name '*.xml' | wc -l)"
    }
}
EOF

	# Generate HTML report
	cat >test-results/index.html <<'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>MakrX Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .passed { color: green; }
        .failed { color: red; }
        .warning { color: orange; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>MakrX Ecosystem Test Results</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Timestamp:</strong> <span id="timestamp"></span></p>
        <p><strong>Unit Tests:</strong> <span id="unit-tests"></span></p>
        <p><strong>Integration Tests:</strong> <span id="integration-tests"></span></p>
        <p><strong>E2E Tests:</strong> <span id="e2e-tests"></span></p>
        <p><strong>Security Tests:</strong> <span id="security-tests"></span></p>
    </div>
    <script>
        fetch('./summary.json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('timestamp').textContent = data.timestamp;
                document.getElementById('unit-tests').textContent = data.results.unit_tests ? 'PASSED' : 'FAILED';
                document.getElementById('integration-tests').textContent = data.results.integration_tests ? 'PASSED' : 'FAILED';
                document.getElementById('e2e-tests').textContent = data.results.e2e_tests ? 'PASSED' : 'FAILED';
                document.getElementById('security-tests').textContent = data.results.security_tests ? 'PASSED' : 'FAILED';
            });
    </script>
</body>
</html>
EOF

} && print_success "Test reports generated"

# Final summary
echo ""
echo "=============================================="
print_status "🎯 TEST SUITE COMPLETE"
echo "=============================================="

# Determine overall status
OVERALL_SUCCESS=true
if [ "$UNIT_TESTS_PASSED" != "true" ]; then
	print_error "Unit tests failed"
	OVERALL_SUCCESS=false
fi

if [ "$INTEGRATION_TESTS_PASSED" != "true" ]; then
	print_error "Integration tests failed"
	OVERALL_SUCCESS=false
fi

if [ "$E2E_TESTS_PASSED" != "true" ]; then
	print_warning "E2E tests had issues"
fi

if [ "$SECURITY_TESTS_PASSED" != "true" ]; then
	print_warning "Security tests found issues"
fi

echo ""
if [ "$OVERALL_SUCCESS" = "true" ]; then
	print_success "All critical tests passed! 🎉"
	echo "📁 Test results: /app/test-results/"
	echo "📊 Coverage reports: /app/coverage/"
	echo "📝 Logs: /app/logs/"
	exit 0
else
	print_error "Some critical tests failed! 💥"
	echo "📁 Test results: /app/test-results/"
	echo "📊 Coverage reports: /app/coverage/"
	echo "📝 Logs: /app/logs/"
	exit 1
fi
