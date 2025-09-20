# 🚀 Deployment Options

## Current status

- CI/CD pipelines are configured under `.github/workflows/`. See `docs/REPOSITORY_OVERVIEW.md` for details.

## Option 1: Install kubectl for Kubernetes Deployment

### Quick kubectl Installation:

```bash
# For Ubuntu/Debian
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify installation
kubectl version --client
```

### Alternative installation methods:

```bash
# Using snap
sudo snap install kubectl --classic

# Using package manager
sudo apt-get update && sudo apt-get install -y kubectl
```

## Option 2: Docker-based local deployment (recommended for testing)

### 🎯 **Quick Docker Staging Test:**

```bash
docker-compose up -d postgres redis keycloak minio
npm run dev
```

## Option 3: Test CI/CD features without deployment

You can test other CI/CD features:

### Monitoring (optional)

Staging compose includes Prometheus at http://localhost:9091. For full monitoring stacks (Grafana, Jaeger), add services as needed.

### **Test Docker Builds:**

```bash
# Test building Docker images
docker build -t makrx/gateway-frontend:test -f apps/gateway-frontend/Dockerfile .
```

### Run performance tests

```bash
# If k6 is installed
k6 run tests/performance/load-test.js

# Or basic load testing with curl
for i in {1..100}; do curl -s http://localhost:3000 > /dev/null; done
```

## Option 4: Full development environment

Start the complete ecosystem for local development:

```bash
./scripts/unix/setup.sh
```

This sets up dependencies and env files; then start with `npm run dev`.

## 🎯 Recommended next steps

1. Validate local dev flow: `npm run dev`
2. Set up staging with `docker-compose.staging.yml` (Postgres at 5434, Redis at 6381, Keycloak at 8082)
3. Add monitoring (Prometheus already included in staging compose)
4. For Kubernetes, install kubectl and create environment overlays under `k8s/`
