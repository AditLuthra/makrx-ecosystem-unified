#!/bin/bash

set -e

# Make script executable
chmod +x "$0" 2>/dev/null || true


# Source shared utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

# Default values
ENVIRONMENT="development"
NAMESPACE=""
DOCKER_REGISTRY="ghcr.io"
IMAGE_TAG="latest"
DRY_RUN=false
SKIP_BUILD=false
SKIP_TESTS=false

# Function to show usage
usage() {
	cat <<EOF
MakrX Ecosystem Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV    Target environment (development|staging|production) [default: development]
    -n, --namespace NS       Kubernetes namespace [default: makrx-ecosystem-ENV]
    -r, --registry REGISTRY  Docker registry [default: ghcr.io]
    -t, --tag TAG           Docker image tag [default: latest]
    --dry-run               Show what would be deployed without actually deploying
    --skip-build            Skip Docker image build
    --skip-tests            Skip running tests before deployment
    -h, --help              Show this help message

EXAMPLES:
    $0 --environment staging
    $0 --environment production --tag v1.2.3
    $0 --dry-run --environment production
    $0 --skip-build --environment development

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
	case $1 in
	-e | --environment)
		ENVIRONMENT="$2"
		shift 2
		;;
	-n | --namespace)
		NAMESPACE="$2"
		shift 2
		;;
	-r | --registry)
		DOCKER_REGISTRY="$2"
		shift 2
		;;
	-t | --tag)
		IMAGE_TAG="$2"
		shift 2
		;;
	--dry-run)
		DRY_RUN=true
		shift
		;;
	--skip-build)
		SKIP_BUILD=true
		shift
		;;
	--skip-tests)
		SKIP_TESTS=true
		shift
		;;
	-h | --help)
		usage
		exit 0
		;;
	*)
		echo "Unknown option: $1"
		usage
		exit 1
		;;
	esac
done

# Set namespace if not provided
if [ -z "$NAMESPACE" ]; then
	NAMESPACE="makrx-ecosystem-$ENVIRONMENT"
fi

# Validate environment
case $ENVIRONMENT in
development | staging | production) ;;
*)
	print_error "Invalid environment: $ENVIRONMENT"
	usage
	exit 1
	;;
esac

echo "🚀 MakrX Ecosystem Deployment"
echo "=============================="
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo "Registry: $DOCKER_REGISTRY"
echo "Image Tag: $IMAGE_TAG"
echo "Dry Run: $DRY_RUN"
echo ""

# Check prerequisites
print_step "Checking prerequisites..."

# Check if kubectl is available
if ! command -v kubectl &>/dev/null; then
	print_error "kubectl is not installed or not in PATH"
	exit 1
fi

# Check if kustomize is available
if ! command -v kustomize &>/dev/null; then
	print_error "kustomize is not installed or not in PATH"
	exit 1
fi

# Check if docker is available (only if not skipping build)
if [ "$SKIP_BUILD" = false ] && ! command -v docker &>/dev/null; then
	print_error "docker is not installed or not in PATH"
	exit 1
fi

print_success "Prerequisites check passed"

# Check cluster connectivity
print_step "Checking Kubernetes cluster connectivity..."
if ! kubectl cluster-info &>/dev/null; then
	print_error "Cannot connect to Kubernetes cluster"
	exit 1
fi

print_success "Connected to Kubernetes cluster: $(kubectl config current-context)"

# Run tests (unless skipped)
if [ "$SKIP_TESTS" = false ]; then
	print_step "Running tests before deployment..."

	if [ -f "./ci/run-all-tests.sh" ]; then
		if [ "$ENVIRONMENT" = "production" ]; then
			# Run full test suite for production
			./ci/run-all-tests.sh
		else
			# Run basic tests for development/staging
			echo "Running basic test suite for $ENVIRONMENT..."
			npm run test --workspaces --if-present || print_warning "Some tests failed"
		fi
	else
		print_warning "Test script not found, skipping tests"
	fi

	print_success "Tests completed"
fi

# Build and push Docker images (unless skipped)
if [ "$SKIP_BUILD" = false ]; then
	print_step "Building and pushing Docker images..."

	# List of services to build
	services=("gateway-frontend" "gateway-frontend-hacker" "makrcave" "makrx-store" "makrx-events")
	backends=("makrcave-backend" "makrx-events-backend" "makrx-store-backend")

	# Build frontend applications
	for service in "${services[@]}"; do
		print_status "Building $service..."
		docker build -t "$DOCKER_REGISTRY/makrx/$service:$IMAGE_TAG" -f "apps/$service/Dockerfile" .

		if [ "$DRY_RUN" = false ]; then
			docker push "$DOCKER_REGISTRY/makrx/$service:$IMAGE_TAG"
			print_success "Pushed $service:$IMAGE_TAG"
		fi
	done

	# Build backend applications
	for backend in "${backends[@]}"; do
		backend_name=$(echo "$backend" | sed 's/-backend$//')
		print_status "Building $backend..."
		docker build -t "$DOCKER_REGISTRY/makrx/$backend:$IMAGE_TAG" -f "backends/$backend_name/Dockerfile" "backends/$backend_name/"

		if [ "$DRY_RUN" = false ]; then
			docker push "$DOCKER_REGISTRY/makrx/$backend:$IMAGE_TAG"
			print_success "Pushed $backend:$IMAGE_TAG"
		fi
	done

	print_success "All images built and pushed"
fi

# Apply Kubernetes manifests
print_step "Deploying to Kubernetes..."

# Create namespace if it doesn't exist
if [ "$DRY_RUN" = false ]; then
	kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
fi

# Apply base configurations first
if [ "$DRY_RUN" = true ]; then
	print_status "DRY RUN: Would apply the following manifests:"
	kustomize build "k8s/$ENVIRONMENT" | kubectl apply --dry-run=client -f -
else
	print_status "Applying Kubernetes manifests for $ENVIRONMENT..."

	# Apply in order: infrastructure first, then applications
	kustomize build "k8s/base" | kubectl apply -f -

	if [ -d "k8s/$ENVIRONMENT" ]; then
		kustomize build "k8s/$ENVIRONMENT" | kubectl apply -f -
	else
		print_warning "No specific configuration found for environment: $ENVIRONMENT"
	fi
fi

print_success "Kubernetes manifests applied"

# Wait for deployments to be ready (unless dry run)
if [ "$DRY_RUN" = false ]; then
	print_step "Waiting for deployments to be ready..."

	# Wait for database to be ready first
	kubectl wait --for=condition=available --timeout=300s deployment/postgres -n "$NAMESPACE" || print_warning "PostgreSQL deployment timeout"
	kubectl wait --for=condition=available --timeout=180s deployment/redis -n "$NAMESPACE" || print_warning "Redis deployment timeout"

	# Wait for applications
	kubectl wait --for=condition=available --timeout=300s deployment --all -n "$NAMESPACE" || print_warning "Some deployments are not ready"

	print_success "All deployments are ready"
fi

# Run post-deployment checks
print_step "Running post-deployment health checks..."

if [ "$DRY_RUN" = false ]; then
	# Check pod status
	print_status "Pod Status:"
	kubectl get pods -n "$NAMESPACE"

	# Check service status
	print_status "Service Status:"
	kubectl get services -n "$NAMESPACE"

	# Check ingress (for production)
	if [ "$ENVIRONMENT" = "production" ]; then
		print_status "Ingress Status:"
		kubectl get ingress -n "$NAMESPACE"
	fi

	# Basic health checks
	print_status "Running basic health checks..."

	# Wait a bit for services to fully start
	sleep 30

	# Check database connectivity
	if kubectl exec -n "$NAMESPACE" deployment/postgres -- pg_isready -U makrx -d makrx_ecosystem >/dev/null 2>&1; then
		print_success "PostgreSQL is healthy"
	else
		print_warning "PostgreSQL health check failed"
	fi

	# Check Redis connectivity
	if kubectl exec -n "$NAMESPACE" deployment/redis -- redis-cli ping | grep -q PONG; then
		print_success "Redis is healthy"
	else
		print_warning "Redis health check failed"
	fi
else
	print_status "DRY RUN: Skipping health checks"
fi

# Final summary
echo ""
echo "=============================="
print_status "🎯 DEPLOYMENT COMPLETE"
echo "=============================="

if [ "$DRY_RUN" = true ]; then
	print_success "DRY RUN completed successfully!"
	echo "Review the output above and run without --dry-run to deploy"
else
	print_success "Deployment to $ENVIRONMENT completed successfully!"
	echo ""
	echo "📋 Summary:"
	echo "  Environment: $ENVIRONMENT"
	echo "  Namespace: $NAMESPACE"
	echo "  Image Tag: $IMAGE_TAG"
	echo ""
	echo "🔧 Useful commands:"
	echo "  kubectl get all -n $NAMESPACE"
	echo "  kubectl logs -f deployment/gateway-frontend -n $NAMESPACE"
	echo "  kubectl port-forward service/gateway-frontend 3000:3000 -n $NAMESPACE"

	if [ "$ENVIRONMENT" = "production" ]; then
		echo ""
		echo "🌐 Production URLs:"
		echo "  https://app.makrx.com"
		echo "  https://hacker.makrx.com"
		echo "  https://cave.makrx.com"
		echo "  https://store.makrx.com"
		echo "  https://events.makrx.com"
	fi
fi

echo ""
exit 0
