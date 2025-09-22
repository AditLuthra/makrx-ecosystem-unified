# MakrX Services Platform Deployment Guide

## Quick Start

### Development Setup

```bash
# Navigate to services app
cd apps/makrx-services

# Start with backend (recommended)
./scripts/start.sh --with-backend

# Or start frontend only
./scripts/start.sh
```

### Production Deployment

```bash
# Deploy services subdomain (nginx inside host)
sudo cp services/nginx/conf.d/services-subdomain.conf /etc/nginx/sites-available/services.makrx.store
sudo ln -s /etc/nginx/sites-available/services.makrx.store /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Start services frontend locally (port 3005 by default)
cd apps/makrx-services && npm ci && npm run build && npm start
```

## Complete Deployment Process

## Ports & routes at a glance

This section summarizes the key ports and reverse-proxy routes for the Services subdomain. See the nginx config at `services/nginx/conf.d/services-subdomain.conf` for source of truth.

### Public routes (via nginx on services.makrx.store)

| Path / Component           | Public endpoint                          | Internal upstream | Port | Notes                                   |
| -------------------------- | ---------------------------------------- | ----------------- | ---- | --------------------------------------- |
| Frontend (Next.js)         | https://services.makrx.store/            | `services_app`    | 3005 | Main UI served by Next.js               |
| API base                   | https://services.makrx.store/api/*       | `services_api`    | 8006 | REST API endpoints                      |
| File upload                | https://services.makrx.store/api/upload  | `services_api`    | 8006 | 100MB limit (client_max_body_size 100M) |
| WebSocket                  | wss://services.makrx.store/ws            | `services_api`    | 8006 | Real-time updates                       |
| Store API proxy (optional) | https://services.makrx.store/store-api/* | `store_api`       | 8000 | Proxies to Store backend `/api/*`       |
| Health (frontend)          | https://services.makrx.store/health      | —                 | —    | nginx returns 200 "healthy"             |
| Health (API)               | https://services.makrx.store/api/health  | `services_api`    | 8006 | API health endpoint                     |

### Local development ports

| Component                   | Local port(s)              | Staging compose note                                          |
| --------------------------- | -------------------------- | ------------------------------------------------------------- |
| Services frontend (Next.js) | 3005                       | Same internally; public via nginx: 443                        |
| Services backend (API)      | 8006                       | Same internally; public via nginx under `/api`                |
| Store backend (API)         | 8000                       | Accessed directly in dev; proxied under `/store-api` in nginx |
| PostgreSQL                  | 5432                       | Staging compose: 5434                                         |
| Redis                       | 6380                       | Staging compose: 6381                                         |
| Keycloak                    | 8081                       | Staging compose: 8082                                         |
| MinIO                       | 9000 (API), 9001 (Console) | Same                                                          |

Notes:

- In production/staging, nginx terminates TLS on 443 and routes to the above internal upstreams.
- The `/store-api/*` route is optional and maps to the Store backend by rewriting the prefix to `/api/` for the upstream.
- WebSocket upgrades are enabled for `/ws` and API routes.

### 1. DNS Configuration

Set up subdomain DNS record:

```
Type: A
Host: services
Value: [SERVER_IP_ADDRESS]
TTL: 300

# Or CNAME if preferred
Type: CNAME
Host: services
Value: makrx.store
TTL: 300
```

### 2. SSL Certificate Setup

#### Option A: Let's Encrypt with Certbot

```bash
# Install certbot if not already installed
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate for subdomain
sudo certbot --nginx -d services.makrx.store

# Verify auto-renewal
sudo certbot renew --dry-run
```

#### Option B: Wildcard Certificate

```bash
# If you already have *.makrx.store certificate
# Update nginx config to use existing certificates:
ssl_certificate /etc/ssl/certs/wildcard.makrx.store.crt;
ssl_certificate_key /etc/ssl/private/wildcard.makrx.store.key;
```

### 3. Nginx Configuration

Deploy the services subdomain configuration:

```bash
# Copy nginx configuration (from repo services/nginx)
sudo cp services/nginx/conf.d/services-subdomain.conf /etc/nginx/sites-available/services.makrx.store

# Enable the site
sudo ln -s /etc/nginx/sites-available/services.makrx.store /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 4. Database Setup

#### Services Database

```bash
# Create database
createdb makrx_services

# Set environment variables
export DATABASE_URL="postgresql://username:password@localhost/makrx_services"

# Run migrations
cd backends/makrx-services
alembic upgrade head
```

#### Update Main Store Database

```bash
# Add service order support to main store
cd backends/makrx-store
python manage.py makemigrations services
python manage.py migrate
```

### 5. Environment Configuration

Create production environment files:

#### Frontend (.env.production)

```bash
# Production URLs
NEXT_PUBLIC_SERVICES_API_URL=https://services.makrx.store/api
NEXT_PUBLIC_STORE_API_URL=https://makrx.store/api
NEXT_PUBLIC_SERVICES_URL=https://services.makrx.store
NEXT_PUBLIC_STORE_URL=https://makrx.store

# Keycloak
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.makrx.store
NEXT_PUBLIC_KEYCLOAK_REALM=makrx
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=makrx-services

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
NEXT_PUBLIC_UPLOAD_ENDPOINT=/api/upload
```

#### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://makrx_services:password@localhost/makrx_services

# Redis
REDIS_URL=redis://localhost:6379/2

# Cross-platform Integration
STORE_API_URL=https://makrx.store/api
SERVICES_API_URL=https://services.makrx.store/api

# File Storage (S3/MinIO)
S3_BUCKET_NAME=makrx-services-files
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Or MinIO
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=makrx-services

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Debug (set to false in production)
DEBUG=false
```

### 6. File Storage Setup

#### Option A: S3 Configuration

```bash
# Create S3 bucket
aws s3 mb s3://makrx-services-files

# Set bucket policy for file uploads
aws s3api put-bucket-cors --bucket makrx-services-files --cors-configuration file://cors-policy.json

# CORS policy (cors-policy.json)
{
    "CORSRules": [
        {
            "AllowedOrigins": ["https://services.makrx.store"],
            "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
            "AllowedHeaders": ["*"],
            "MaxAgeSeconds": 3000
        }
    ]
}
```

#### Option B: Local MinIO

```bash
# Start MinIO
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -v /data/minio:/data \
  minio/minio server /data --console-address ":9001"

# Create bucket
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/makrx-services
```

### 7. Process Management

#### Systemd Service Files

**Frontend Service** (`/etc/systemd/system/makrx-services-frontend.service`):

```ini
[Unit]
Description=MakrX Services Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/makrx-services/apps/makrx-services
Environment=NODE_ENV=production
Environment=PORT=3005
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Backend Service** (`/etc/systemd/system/makrx-services-backend.service`):

```ini
[Unit]
Description=MakrX Services Backend API
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/makrx-services/backends/makrx-services
Environment=PYTHONPATH=/var/www/makrx-services/backends/makrx-services
ExecStart=/var/www/makrx-services/backends/makrx-services/.venv/bin/python -m app.main
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start services:

```bash
sudo systemctl enable makrx-services-frontend makrx-services-backend
sudo systemctl start makrx-services-frontend makrx-services-backend
sudo systemctl status makrx-services-frontend makrx-services-backend
```

### 8. Monitoring Setup

#### Health Check Script (`/usr/local/bin/check-services.sh`):

```bash
#!/bin/bash

# Check frontend
if ! curl -f http://localhost:3005/health > /dev/null 2>&1; then
    echo "Frontend health check failed"
    systemctl restart makrx-services-frontend
fi

# Check backend
if ! curl -f http://localhost:8006/health > /dev/null 2>&1; then
    echo "Backend health check failed"
    systemctl restart makrx-services-backend
fi

# Check cross-platform sync
response=$(curl -s http://localhost:8006/api/orders/health-check)
if [[ $response != *"healthy"* ]]; then
    echo "Cross-platform sync health check failed"
fi
```

#### Crontab Entry:

```bash
# Check services every 5 minutes
*/5 * * * * /usr/local/bin/check-services.sh >> /var/log/makrx-services-health.log 2>&1
```

### 9. Security Configuration

#### Firewall Rules:

```bash
# Allow nginx
sudo ufw allow 'Nginx Full'

# Block direct access to services
sudo ufw deny 3005
sudo ufw deny 8006

# Allow from localhost only for services
sudo ufw allow from 127.0.0.1 to any port 3005
sudo ufw allow from 127.0.0.1 to any port 8006
```

#### File Permissions:

```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/makrx-services

# Set file permissions
find /var/www/makrx-services -type f -exec chmod 644 {} \;
find /var/www/makrx-services -type d -exec chmod 755 {} \;

# Make scripts executable
chmod +x /var/www/makrx-services/apps/makrx-services/scripts/start.sh
chmod +x /usr/local/bin/check-services.sh
```

### 10. Testing Deployment

#### Pre-launch Tests:

```bash
# Test nginx configuration
sudo nginx -t

# Test SSL certificate
openssl s_client -connect services.makrx.store:443 -servername services.makrx.store

# Test services health
curl https://services.makrx.store/health
curl https://services.makrx.store/api/health

# Test cross-platform integration
curl -X POST https://services.makrx.store/api/test/store-sync
```

#### Post-launch Verification:

1. **Homepage Load Test**: Visit https://services.makrx.store
2. **Provider Dashboard**: Test provider login and job management
3. **File Upload**: Test STL/SVG file uploads
4. **Order Creation**: Create test service order
5. **Cross-platform Sync**: Verify order appears in main store
6. **Real-time Updates**: Test WebSocket connections
7. **Mobile Responsiveness**: Test on mobile devices

### 11. Performance Optimization

#### Frontend Optimization:

```bash
# Build with production optimizations
NODE_ENV=production npm run build

# Enable Gzip in nginx (already in config)
# Enable caching for static assets (already in config)
```

#### Backend Optimization:

```bash
# Use production ASGI server
pip install gunicorn[gevent]

# Update systemd service to use gunicorn
ExecStart=/var/www/makrx-services/backends/makrx-services/.venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8006
```

#### Database Optimization:

```sql
-- Create indexes for cross-platform queries
CREATE INDEX idx_service_orders_user_id ON service_orders(user_id);
CREATE INDEX idx_service_orders_store_order_id ON service_orders(store_order_id);
CREATE INDEX idx_service_orders_sync_status ON service_orders(sync_status);
CREATE INDEX idx_service_orders_status ON service_orders(status);

-- Create composite indexes
CREATE INDEX idx_service_orders_user_status ON service_orders(user_id, status);
CREATE INDEX idx_service_orders_provider_status ON service_orders(provider_id, status);
```

### 12. Backup Strategy

#### Database Backups:

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/makrx-services"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup services database
pg_dump makrx_services | gzip > $BACKUP_DIR/makrx_services_$DATE.sql.gz

# Backup store database (service orders only)
pg_dump -t service_orders makrx_store | gzip > $BACKUP_DIR/store_service_orders_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

#### File Storage Backups:

```bash
# S3 sync for uploaded files
aws s3 sync s3://makrx-services-files s3://makrx-services-backup/$(date +%Y%m%d)/

# Or for local storage
rsync -av /var/www/uploads/ /backups/uploads/$(date +%Y%m%d)/
```

## Troubleshooting

### Common Issues

1. **Cross-platform Sync Failing**:

   ```bash
   # Check backend logs
   journalctl -u makrx-services-backend -f

   # Test store API connectivity
   curl -X GET https://makrx.store/api/health
   ```

2. **File Upload Issues**:

   ```bash
   # Check nginx file size limits
   grep client_max_body_size /etc/nginx/sites-enabled/services.makrx.store

   # Check upload directory permissions
   ls -la /var/www/makrx-services/uploads/
   ```

3. **WebSocket Connection Problems**:

   ```bash
   # Test WebSocket endpoint
   wscat -c ws://localhost:8006/ws

   # Check nginx WebSocket configuration
   nginx -T | grep -A 10 "location /ws"
   ```

4. **Provider Dashboard Not Loading**:

   ```bash
   # Check Keycloak integration
   curl -X GET https://auth.makrx.store/realms/makrx

   # Verify service provider role
   # Check in Keycloak admin console
   ```

### Log Files

- **Frontend**: `/var/log/makrx-services-frontend.log`
- **Backend**: `/var/log/makrx-services-backend.log`
- **Nginx**: `/var/log/nginx/services.makrx.store.access.log`
- **Cross-platform Sync**: Check backend logs for sync errors

## Success Metrics

After deployment, monitor these key metrics:

- **Order Sync Success Rate**: Should be >99%
- **Page Load Time**: <2 seconds average
- **API Response Time**: <200ms average
- **WebSocket Uptime**: >99.9%
- **File Upload Success**: >98%
- **Provider Response Time**: <30 seconds average

## Support

For deployment issues:

1. Check logs in `/var/log/`
2. Verify all services are running: `systemctl status makrx-services-*`
3. Test cross-platform connectivity
4. Check database connectivity and migrations
5. Verify file storage and upload functionality

---

**Deployment Status**: Ready for production
**Platform URL**: https://services.makrx.store
**Estimated Setup Time**: 2-3 hours
