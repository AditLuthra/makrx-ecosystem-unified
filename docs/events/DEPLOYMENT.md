# Deployment Guide - MakrX.events

This guide covers deployment options for MakrX.events across different platforms.

## 🌐 Vercel Deployment

### Prerequisites

- Vercel account
- GitHub repository
- PostgreSQL database (Neon/Supabase)

### Step 1: Prepare Repository

```bash
# Ensure package.json has correct build scripts
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### Step 2: Deploy to Vercel

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**

   ```bash
   # In Vercel project settings, add:
   DATABASE_URL=postgresql://...
   SESSION_SECRET=your-random-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-nextauth-secret

   # Payment processing
   VITE_RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_SECRET=your-secret

   # Email service
   SENDGRID_API_KEY=SG.your-key
   SMTP_FROM=noreply@yourdomain.com
   ```

3. **Deploy**
   ```bash
   # Auto-deployment on git push
   git push origin main
   ```

### Step 3: Database Migration

```bash
# Run locally to push schema
npm run db:push

# Or use Vercel CLI
npx vercel env pull .env.local
npm run db:push --force
```

## 🐳 Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Docker Compose

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/makrx
      - SESSION_SECRET=your-session-secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: makrx
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Step 3: Deploy

```bash
# Build and run
docker-compose up -d

# Run database migrations
docker-compose exec app npm run db:push
```

## ☁️ AWS Deployment

### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect your GitHub repository

2. **Build Settings**

   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - npm ci
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: .next
           files:
             - "**/*"
         cache:
           paths:
             - node_modules/**/*
   ```

3. **Environment Variables**
   Add in Amplify console:
   ```
   DATABASE_URL=postgresql://...
   SESSION_SECRET=your-secret
   NEXTAUTH_URL=https://your-app.amplifyapp.com
   ```

### Using ECS + RDS

1. **Create RDS PostgreSQL Instance**
2. **Build Docker Image**
3. **Deploy to ECS**
4. **Configure Load Balancer**

## 🔧 Production Configuration

### Environment Variables

```bash
# Production environment
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://prod-connection-string

# Security
SESSION_SECRET=strong-random-secret-256-bits
NEXTAUTH_SECRET=another-strong-secret

# Performance
DATABASE_POOL_SIZE=10
REDIS_URL=redis://your-redis-instance (optional)

# Monitoring
SENTRY_DSN=https://your-sentry-dsn (optional)
```

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_events_start_date ON events(start_date);
CREATE INDEX CONCURRENTLY idx_registrations_event_id ON event_registrations(event_id);
CREATE INDEX CONCURRENTLY idx_teams_event_id ON teams(event_id);
CREATE INDEX CONCURRENTLY idx_leaderboard_entries_event_id ON leaderboard_entries(event_id);
```

### Security Checklist

- [ ] **HTTPS Enabled** - Force HTTPS in production
- [ ] **Environment Variables Secured** - No secrets in code
- [ ] **Database Connection Secured** - Use SSL connections
- [ ] **Rate Limiting** - Implement API rate limits
- [ ] **Input Validation** - Validate all user inputs
- [ ] **CORS Configuration** - Configure allowed origins
- [ ] **Authentication Headers** - Secure cookie settings
- [ ] **File Upload Security** - Validate and sanitize uploads

### Performance Optimization

1. **Database Connection Pooling**

   ```typescript
   // In lib/db.ts
   export const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 10, // Maximum connections
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

2. **Caching Strategy**

   ```typescript
   // Use Next.js ISR for event pages
   export const revalidate = 60; // Revalidate every 60 seconds
   ```

3. **Image Optimization**
   ```typescript
   // Use Next.js Image component
   import Image from "next/image";
   ```

## 📊 Monitoring & Analytics

### Application Monitoring

```bash
# Add error tracking
npm install @sentry/nextjs

# Add performance monitoring
npm install @vercel/analytics
```

### Database Monitoring

```sql
-- Monitor slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Health Checks

```typescript
// Add health check endpoint
// app/api/health/route.ts
export async function GET() {
  try {
    await db.select().from(users).limit(1);
    return Response.json({ status: "healthy" });
  } catch (error) {
    return Response.json({ status: "unhealthy" }, { status: 500 });
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Fails**

   ```bash
   # Check connection string format
   postgresql://username:password@host:port/database?sslmode=require
   ```

2. **Authentication Errors**

   ```bash
   # Verify environment variables
   echo $SESSION_SECRET
   echo $NEXTAUTH_URL
   ```

3. **Build Failures**

   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

4. **Database Schema Issues**
   ```bash
   # Force schema sync
   npm run db:push --force
   ```

### Performance Issues

- Check database connection pool settings
- Monitor memory usage and optimize queries
- Enable compression and caching
- Use CDN for static assets

### Security Issues

- Rotate secrets regularly
- Update dependencies
- Monitor for vulnerabilities
- Review access logs

## 📞 Support

For deployment support:

- 📧 Email: devops@makrx.events
- 💬 Discord: [MakrX DevOps](https://discord.gg/makrx-devops)
- 📚 Docs: [docs.makrx.events/deployment](https://docs.makrx.events/deployment)
