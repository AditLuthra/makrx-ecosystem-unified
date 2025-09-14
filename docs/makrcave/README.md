# MakrCave - Enterprise Makerspace Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-blue)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-green)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)](https://postgresql.org/)

## 🚀 Overview

MakrCave is a comprehensive, enterprise-grade makerspace management platform that provides advanced tools for managing makerspaces, equipment, inventory, members, projects, and operations. Originally migrated from MyTrial, this platform offers advanced features including multi-tenant architecture, role-based access control, equipment reservations, inventory management, project collaboration, and integrated billing systems.

The application serves both as a makerspace discovery platform and a complete management solution for FabLabs and makerspaces worldwide.

## ✨ Key Features

### 🏭 Makerspace Management

- **Multi-tenant Architecture** - Support for multiple makerspaces
- **Equipment Management** - Track, reserve, and maintain equipment
- **Inventory Control** - Smart inventory tracking with low-stock alerts
- **Member Management** - Comprehensive user and membership management
- **Project Collaboration** - Real-time project collaboration tools

### 💰 Business Operations

- **Integrated Billing** - Subscription management and payment processing
- **Analytics Dashboard** - Comprehensive usage and financial analytics
- **Reservation System** - Advanced equipment booking with conflict resolution
- **Access Control** - Role-based permissions and physical access management
- **Notification System** - Real-time alerts and communication tools

### 🔧 Technical Features

- **Enterprise SSO** - Keycloak integration for secure authentication
- **RESTful API** - Comprehensive API with OpenAPI documentation
- **Real-time Updates** - WebSocket connections for live data
- **Mobile Responsive** - Optimized for all device types
- **Multi-language Support** - Internationalization ready

## 🏗️ Architecture

### Frontend (Next.js 14 + React 18)

```
app/                    # Next.js App Router pages
├── portal/            # Makerspace portal interface
├── dashboard/         # Main dashboard
├── equipment/         # Equipment management
├── inventory/         # Inventory control
└── projects/          # Project management

components/            # React components
├── ui/               # Base UI components (Radix UI)
├── modals/           # Modal dialogs
├── analytics/        # Analytics components
└── billing/          # Billing interfaces

contexts/             # React Context providers
hooks/                # Custom React hooks
lib/                  # Utility libraries
services/             # API service layer
```

### Backend (FastAPI + Python)

```
backend/
├── routes/           # API endpoint definitions
├── models/           # SQLAlchemy database models
├── schemas/          # Pydantic request/response schemas
├── crud/             # Database operations
├── security/         # Authentication & authorization
├── services/         # External service integrations
└── utils/            # Utility functions
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.11+
- **PostgreSQL** 14+
- **Redis** (for caching and sessions)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd makrcave
```

2. **Frontend Setup**

```bash
npm install
```

3. **Backend Setup**

```bash
cd backend
pip install -r requirements.txt
```

4. **Environment Configuration**

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp .env.example .env

# Configure your environment variables
# - Database connection strings
# - Keycloak authentication settings
# - API keys and secrets
```

5. **Database Setup**

```bash
# Initialize the database
cd backend
python init_db.py
```

6. **Start the Services**

```bash
# Terminal 1: Backend API
cd backend
python start.py

# Terminal 2: Frontend
npm run dev
```

7. **Access the Application**

- **Frontend**: http://localhost:5000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/health

## 📚 Documentation

### API Documentation

- **Interactive Docs**: Available at `/docs` when running the backend
- **OpenAPI Schema**: Available at `/openapi.json`
- **Backend README**: [backend/API_README.md](backend/API_README.md)

### Component Documentation

- **Frontend Components**: [components/README.md](components/README.md)
- **Pages Structure**: [pages/README.md](pages/README.md)
- **Context Providers**: [contexts/README.md](contexts/README.md)

### Configuration

- **Environment Variables**: See `.env.example` files
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md) _(coming soon)_

## 🔒 Security

### Authentication & Authorization

- **Keycloak SSO** - Enterprise-grade authentication
- **JWT Tokens** - Stateless authentication with refresh tokens
- **RBAC** - Role-based access control with fine-grained permissions
- **Multi-factor Authentication** - Optional MFA support

### Data Protection

- **Encryption** - Data encrypted at rest and in transit
- **Input Validation** - Comprehensive server-side validation
- **Rate Limiting** - API rate limiting and DDoS protection
- **Security Headers** - CORS, CSP, and other security headers

## 🚀 Deployment

### Production Deployment

```bash
# Build frontend
npm run build

# Start production services
npm run start          # Frontend
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000  # Backend
```

### Docker Deployment

```bash
# Build images
docker build -t makrcave-frontend .
docker build -t makrcave-backend ./backend

# Run with docker-compose
docker-compose up -d
```

### Cloud Deployment

Supports deployment to:

- **Replit** (Current platform)
- **AWS ECS/EKS**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**

## 🧪 Testing

### Frontend Testing

```bash
npm run test          # Run Jest tests
npm run test:e2e      # Run Playwright E2E tests
npm run lint          # ESLint checks
```

### Backend Testing

```bash
cd backend
pytest tests/         # Run all tests
pytest --cov=.        # With coverage
```

## 🛠️ Development

### Code Style

- **Frontend**: ESLint + Prettier with TypeScript strict mode
- **Backend**: Black + isort with type hints
- **Commits**: Conventional Commits standard

### Development Tools

- **Hot Reload**: Enabled for both frontend and backend
- **Type Checking**: Full TypeScript and Python type coverage
- **API Testing**: Integrated OpenAPI documentation
- **Database Migrations**: Alembic for schema management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the code style guidelines
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow existing code patterns
- Add comprehensive tests
- Update documentation
- Ensure all tests pass
- Use meaningful commit messages

## 📊 Monitoring

### Health Checks

- **Application Health**: `/health` endpoint
- **Database Status**: Automated connectivity checks
- **External Services**: Integration health monitoring

### Analytics

- **Usage Metrics**: Equipment utilization, member activity
- **Performance**: Response times, error rates
- **Business Metrics**: Revenue, growth, retention

## 🗺️ Roadmap

### Near-term (Q1 2025)

- [ ] Enhanced mobile app
- [ ] Advanced analytics dashboard
- [ ] Automated billing integration
- [ ] Multi-language support

### Long-term (2025+)

- [ ] IoT device integration
- [ ] AI-powered recommendations
- [ ] Advanced reporting suite
- [ ] Enterprise federation

## 📞 Support

### Community

- **Documentation**: Comprehensive guides and API docs
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for community support

### Enterprise Support

Contact us for:

- Custom deployment assistance
- Enterprise integration support
- Training and onboarding
- SLA-backed support contracts

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [FastAPI](https://fastapi.tiangolo.com/)
- UI components from [Radix UI](https://radix-ui.com/)
- Authentication powered by [Keycloak](https://keycloak.org/)

---

**MakrCave** - Empowering makerspaces worldwide with enterprise-grade management tools.ement tools.
