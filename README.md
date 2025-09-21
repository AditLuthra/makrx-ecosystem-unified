# MakrX Ecosystem - Unified Monorepo

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
[![Contributors](https://img.shields.io/badge/Contributors-Welcome-brightgreen.svg)](CONTRIBUTING.md)

A comprehensive ecosystem of interconnected applications and services built for modern event management, marketplace functionality, and community engagement.

> Documentation: See the full Repository Overview at [docs/REPOSITORY_OVERVIEW.md](docs/REPOSITORY_OVERVIEW.md)
>
> Configuration Standards: Canonical envs and storage precedence are documented in [docs/CONFIGURATION_STANDARDS.md](docs/CONFIGURATION_STANDARDS.md)

### 📚 Docs navigation

- Documentation Index: [docs/README.md](docs/README.md)
- Repository Overview: [docs/REPOSITORY_OVERVIEW.md](docs/REPOSITORY_OVERVIEW.md)
- Deployment Options: [DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md)
- Services Deployment (subdomain): [SERVICES_DEPLOYMENT_GUIDE.md](SERVICES_DEPLOYMENT_GUIDE.md)
- Feature Flags Guide: [FEATURE_FLAGS_GUIDE.md](FEATURE_FLAGS_GUIDE.md)
- Errors & Guidance: [ERRORS_AND_GUIDANCE.md](ERRORS_AND_GUIDANCE.md)

Tip: Compatibility aliases for MakrCave API and preferred endpoints are tracked in [docs/CHANGELOG.md](docs/CHANGELOG.md) under Unreleased.

### 🔐 Auth configuration (Keycloak)

We use Keycloak for SSO across all apps/services. Unified env var names and local dev defaults are documented here:

- Auth Contract: [docs/auth-contract.md](docs/auth-contract.md)

## 🏗️ Architecture Overview

## Environment templates

Sample environment files are provided under `examples/` for all frontends and backends (e.g. `.env.makrx-services.local`, `.env.makrx-services-backend`).

- For Next.js apps, copy the relevant example to the app folder as `.env.local` and adjust values.
- For Python backends, copy the example to the backend folder as `.env` (or export in your process manager) and adjust values.

These templates follow the conventions documented in `docs/CONFIGURATION_STANDARDS.md`.

```mermaid
graph TB
    subgraph "Frontend Applications"
        GF[Gateway Frontend<br/>:3000]
        GH[Gateway Hacker<br/>:3001]
        MC[MakrCave<br/>:3002]
        MS[MakrX Store<br/>:3003]
        ME[MakrX Events<br/>:3004]
    end

    subgraph "Backend Services"
        MCB[MakrCave API<br/>:8001]
        MEB[Events API<br/>:8002]
        MSB[Store API<br/>:8003]
    end

    subgraph "Infrastructure"
        KC[Keycloak<br/>:8081]
    PG[PostgreSQL<br/>:5432]
        RD[Redis<br/>:6380]
        MN[MinIO<br/>:9002]
    end

    subgraph "Shared Packages"
        AU[Auth Package]
        UI[Shared UI]
        TY[Types Package]
    end

    GF --> KC
    GH --> KC
    MC --> MCB
    MS --> MSB
    ME --> MEB

    MCB --> PG
    MEB --> PG
    MSB --> PG

    MCB --> RD
    MEB --> RD
    MSB --> RD

    MC --> AU
    MS --> AU
    ME --> AU

    MC --> UI
    MS --> UI
    ME --> UI
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (CI also uses Node 20)
- Docker & Docker Compose
- Git

### One-Command Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd makrx-ecosystem-unified

# For Unix/Linux/macOS
./scripts/unix/setup.sh

# For Windows
scripts\windows\setup.bat
```

### Manual Setup

1. **Install Dependencies**

   ```bash
    npm ci --legacy-peer-deps
   ```

2. **Environment Configuration (Secrets Policy)**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   - Do not commit real secrets. Only `.env.example` should contain sample values.
   - Backend services also include per-service `.env.example` files (see `backends/*/.env.example`).
   - The repo’s `.gitignore` excludes `.env*` by default.

3. **Start Infrastructure**

   ```bash
    docker-compose up -d postgres redis keycloak minio
   ```

4. **Start Development Servers**
   ```bash
    npm run dev
   ```

## 🎯 Applications & Services

### Frontend Applications

| Application          | Port | Description                    | Technology |
| -------------------- | ---- | ------------------------------ | ---------- |
| **Gateway Frontend** | 3000 | Main landing and gateway       | Next.js 14 |
| **Gateway Hacker**   | 3001 | Developer-focused interface    | Next.js 14 |
| **MakrCave**         | 3002 | Event management platform      | Next.js 14 |
| **MakrX Store**      | 3003 | Marketplace platform           | Next.js 14 |
| **MakrX Events**     | 3004 | Event discovery and management | Next.js 14 |

### Backend Services

| Service          | Port | Description              | Technology       |
| ---------------- | ---- | ------------------------ | ---------------- |
| **MakrCave API** | 8001 | Event management backend | FastAPI (Python) |
| **Events API**   | 8002 | Events backend API       | FastAPI (Python) |
| **Store API**    | 8003 | Marketplace backend      | FastAPI (Python) |

### Infrastructure Services

| Service        | Port(s)    | Description                    |
| -------------- | ---------- | ------------------------------ |
| **Keycloak**   | 8081       | Authentication & Authorization |
| **PostgreSQL** | 5432       | Primary database               |
| **Redis**      | 6380       | Caching & sessions             |
| **MinIO**      | 9000, 9001 | Object storage (API, Console)  |

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start all development servers
npm run dev:apps         # Start only frontend apps
npm run dev:backends     # Start only backend services

# Building
npm run build           # Build all applications
npm run build:apps      # Build only frontend apps

# Testing
npm run test           # Run all tests
npm run test:unit      # Run unit tests
npm run test:e2e       # Run end-to-end tests

# Linting
npm run lint           # Lint all code
npm run lint:fix       # Fix linting issues

# Database
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed database with sample data

# Docker
npm run docker:dev     # Start development environment with Docker
npm run docker:prod    # Start production environment with Docker
```

### Tooling & Versions

- Package manager: `npm` with workspaces.
- Node.js: 20+ (CI uses Node 20).
- Next.js: pinned to 14.2.32 across apps.
- FastAPI across backends; see per-backend `requirements.txt` for exact pins.

### Project Structure

```
makrx-ecosystem-unified/
├── apps/                          # Frontend applications
│   ├── gateway-frontend/          # Main gateway (Next.js)
│   ├── gateway-frontend-hacker/   # Developer gateway (Next.js)
│   ├── makrcave/                  # Event management (Next.js)
│   ├── makrx-events/              # Event discovery (Next.js)
│   └── makrx-store/               # Marketplace (Next.js)
├── backends/                      # Backend services
│   ├── makrcave/                  # Event API (FastAPI)
│   ├── makrx_events/             # Events service (FastAPI)
│   └── makrx-store/               # Store API (FastAPI)
├── packages/                      # Shared packages
│   ├── auth/                      # Authentication utilities
│   ├── shared-ui/                 # Shared UI components
│   └── types/                     # TypeScript type definitions
├── services/                      # Infrastructure configurations
│   ├── keycloak/                  # Keycloak configuration
│   ├── postgres/                  # Database setup
│   └── nginx/                     # Reverse proxy config
├── k8s/                          # Kubernetes deployments
├── monitoring/                    # Monitoring stack (Prometheus, Grafana)
└── .github/                      # GitHub Actions workflows
```

## 🔐 Authentication

The ecosystem uses **Keycloak** for centralized authentication and authorization:

- **Realm**: `makrx`
- **Clients**: One for each application
- **Roles**: User, Admin, Developer
- **SSO**: Single Sign-On across all applications

### Authentication Flow

1. User accesses any application
2. Redirected to Keycloak login
3. After successful authentication, redirected back with tokens
4. Applications use tokens to access protected resources

### Frontend Auth Usage

- Use `KeycloakProvider` from `@makrx/auth` at the app root providers.
- Use `useAuthHeaders()` for fetch calls; do not read tokens from `localStorage`.
- ESLint rules prevent mock-token or direct `localStorage.getItem('auth_token')` usage.

## 🗄️ Database Schema

The ecosystem uses a **shared PostgreSQL database** with service-specific schemas:

- `makrcave_*`: Event management tables
- `store_*`: Marketplace tables
- `events_*`: Event processing tables
- `auth_*`: User and authentication data

## 🚀 Deployment

### Development

```bash
docker-compose up -d postgres redis keycloak minio
npm run dev
```

### Security Headers & CSP

- Nginx production config enforces a strict Content Security Policy (CSP) with no `unsafe-inline`.
- Non-container config under `nginx/services-subdomain.conf` is hardened to avoid inline styles/scripts.
- Use nonces/hashes for any exceptional inline requirements.

### Staging

```bash
docker-compose -f docker-compose.staging.yml up -d
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
kubectl apply -f k8s/
```

### Production Readiness (Backends)

- Migrations: Alembic configured per backend (e.g., `backends/makrcave/alembic.ini`).
- Readiness/Liveness: `/api/v1/health/readyz` and `/api/v1/health/live` per service.
- Rate limiting: Redis‑backed when `REDIS_URL` is set; in‑memory fallback.
- Logging: Structlog JSON logs; optional Prometheus metrics at `/metrics` when enabled.
- Runtime: uvicorn by default; optional gunicorn workers via env.

See `BACKENDS_CONVENTIONS.md` and `backends/makrcave/README.md` for details.

## 🧪 Testing

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### End-to-End Tests

```bash
npm run test:e2e
```

### Load Testing

```bash
npm run test:load
```

## 📊 Monitoring

Monitoring stack is optional and not enabled by default in `docker-compose.yml`.
If you enable monitoring, see `docs/REPOSITORY_OVERVIEW.md` for pointers and update
ports accordingly.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

### Code Standards

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Jest** for testing

## 📋 Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://makrx:password@localhost:5432/makrx_ecosystem

# Redis
REDIS_URL=redis://localhost:6380

# Keycloak
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=makrx

# Application URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
```

### Inter-service URLs

Some backends make internal API calls to others. For local runs started via scripts (outside Docker), set:

```bash
# MakrCave API base URL used by the Store backend
MAKRCAVE_API_URL=http://localhost:8001
```

When running inside Docker, services communicate via Docker DNS. No change needed; defaults typically resolve to:

```text
http://makrcave-backend:8000
```

See the consolidated [Documentation Index](docs/README.md) for environment variables and details.

### Secret Management Policy

- Never commit real secrets — only use `.env` locally and `.env.example` in git.
- Rotate credentials if accidental commits occur and scrub history where possible.

See [SECURITY.md](SECURITY.md) for disclosure and security practices.

## 🐛 Troubleshooting

### Common Issues

**Port conflicts**: Check if services are already running

```bash
lsof -i :3000  # Check if port 3000 is in use
```

**Database connection**: Ensure PostgreSQL is running

```bash
docker-compose logs postgres
```

**Keycloak issues**: Restart Keycloak service

```bash
docker-compose restart keycloak
```

See [Documentation Index](docs/README.md) for troubleshooting guides.

## 📖 Documentation

- Documentation Index: `docs/README.md`
- Contributing Guide: `CONTRIBUTING.md`

Legacy guides from prior repos are available under `docs/*`.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [Keycloak](https://www.keycloak.org/)
- Database by [PostgreSQL](https://www.postgresql.org/)
- Containerization by [Docker](https://docker.com/)

## 📞 Support

- **GitHub Issues**: [Report bugs and request features](../../issues)
- **Discussions**: [Community discussions](../../discussions)
- **Email**: support@makrx.com

---

**Made with ❤️ by the MakrX Team**
