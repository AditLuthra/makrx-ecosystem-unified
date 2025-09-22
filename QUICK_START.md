# MakrX Ecosystem Quick Start

## 🚀 Fast setup (recommended)

```bash
# 1. Check system status
npm run diagnose

# 2. Start simple mode (no auth)
npm run dev:simple

# 3. Or start full ecosystem (with auth)
npm run dev

# 4. Stop everything
npm run stop
```

## 📋 System requirements

- Node.js 20+
- Python 3.12 (for backend services)
- Docker (for infrastructure)
- npm 8+

## 🏗️ Architecture overview

### Frontend applications (ports 3000-3004)

- `gateway-frontend` (3000) - Main landing page
- `gateway-frontend-hacker` (3001) - Alternative landing page
- `makrcave` (3002) - Makerspace management
- `makrx-store` (3003) - E-commerce platform
- `makrx-events` (3004) - Event management

### Backend services (ports 8001-8003)

- `makrcave-api` (8001) - FastAPI service
- `makrx-events-api` (8002) - FastAPI service
- `makrx-store-api` (8003) - FastAPI service

### Infrastructure services

- PostgreSQL (5432)
- Redis (6380)
- Keycloak (8081)
- MinIO (9000 API, 9001 Console)

## 🐛 Troubleshooting

### Common Issues

1. "python not found"

   ```bash
   # Verify python3 is available
   which python3  # Should show path
   ```

2. Missing dependencies

   ```bash
   npm run fix-deps  # Installs all missing deps
   ```

3. Port conflicts

   ```bash
   npm run diagnose  # Shows port usage
   # Kill conflicting processes if needed
   ```

4. Docker issues
   ```bash
   docker-compose down  # Stop all containers
   docker-compose up -d postgres redis keycloak minio  # Restart infrastructure
   ```

## 🔧 Development workflow

1. **Daily startup**: `npm run dev:simple`
2. **Check status**: `npm run diagnose`
3. **Stop services**: `npm run stop`
4. **Full startup with auth**: `npm run dev`

## 📁 Important files

`scripts/start.sh` - Advanced startup script with GUI terminals

## 🌐 Access URLs

Once running, access your applications at:

- http://localhost:3000 - Gateway Frontend
- http://localhost:3001 - Gateway Frontend Hacker
- http://localhost:3002 - MakrCave
- http://localhost:3003 - MakrX Store
- http://localhost:3004 - MakrX Events

## 📞 Support

If you encounter issues:

1. Run `npm run diagnose` for system status
2. Check the logs in your terminal
3. Try the individual test script: `npm run test-single` (see `_waste_archive/` helpers if needed)
4. Restart infrastructure: `docker-compose restart`
