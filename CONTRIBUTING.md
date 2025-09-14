# Contributing to MakrX Ecosystem

We welcome contributions to the MakrX Ecosystem! This document will guide you through the contribution process.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Getting Help](#getting-help)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment
4. Create a feature branch
5. Make your changes
6. Test your changes
7. Submit a pull request

## Development Setup

### Prerequisites

- **Node.js** 20.x or higher
- **Docker** and **Docker Compose**
- **Git**
- **pnpm** (recommended) or **npm**

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/makrx-ecosystem-unified.git
cd makrx-ecosystem-unified

# Copy environment variables
cp .env.example .env
# Edit .env with your preferred values (see Development Configuration below)

# Install dependencies
npm install

# Set up and start development services
./setup_and_start.sh
```

### Development Configuration

Edit your `.env` file with the following recommended development values:

```bash
# Use secure but simple passwords for development
POSTGRES_PASSWORD=dev_secure_pass123
KEYCLOAK_ADMIN_PASSWORD=admin_secure_pass123
KEYCLOAK_CLIENT_SECRET=dev_client_secret_123
MINIO_ROOT_PASSWORD=minio_secure_pass123
S3_SECRET_KEY=minio_secret_key_123
```

### Starting the Development Environment

```bash
# Start all services
./start-dev.sh

# Or start individual components:
./start-backends.sh    # Start backend APIs only
npm run dev           # Start frontend apps only
```

### Development URLs

Once running, access the applications at:

- **Gateway Frontend**: http://localhost:3000
- **Gateway Frontend Hacker**: http://localhost:3001
- **MakrCave**: http://localhost:3002
- **MakrX Store**: http://localhost:3003
- **MakrX Events**: http://localhost:3004
- **Keycloak Admin**: http://localhost:8081 (admin/your_admin_password)

## Project Structure

```
makrx-ecosystem-unified/
├── apps/                          # Frontend applications
│   ├── gateway-frontend/          # Main gateway (Next.js)
│   ├── gateway-frontend-hacker/   # Alternative gateway (Next.js)
│   ├── makrcave/                  # Makerspace portal (Next.js)
│   ├── makrx-store/              # E-commerce platform (Next.js)
│   └── makrx-events/             # Events management (Next.js)
├── backends/                      # Backend APIs
│   ├── makrcave/                 # MakrCave API (FastAPI)
│   ├── makrx_events/            # Events API (FastAPI)
│   └── makrx-store/              # Store API (FastAPI)
├── packages/                      # Shared packages
│   ├── shared-ui/                # Shared React components
│   ├── auth/                     # Authentication utilities
│   └── types/                    # Shared TypeScript types
├── services/                      # Infrastructure services
│   ├── keycloak/                 # SSO configuration
│   ├── postgres/                 # Database setup
│   └── nginx/                    # Reverse proxy config
└── .github/                       # CI/CD workflows
```

## Making Changes

### Branch Naming Convention

- `feature/description-of-feature`
- `bugfix/description-of-bug`
- `hotfix/critical-fix`
- `docs/documentation-update`

### Commit Message Format

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:

- `feat(auth): add OAuth2 integration`
- `fix(store): resolve payment processing error`
- `docs(readme): update setup instructions`

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific app
cd apps/gateway-frontend
npm test

# Run backend tests
cd backends/makrcave
python -m pytest

# Run integration tests
python final_integration_test.py
```

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Maintain test coverage above 70%
- Integration tests must pass for all components

### Manual Testing

Before submitting:

1. Test your changes in development environment
2. Verify all applications start without errors
3. Test SSO login flow across applications
4. Check responsive design on different screen sizes
5. Test with different browsers (Chrome, Firefox, Safari)

## Submitting Changes

### Pull Request Process

1. **Update Documentation**: Update README.md or other docs if needed
2. **Add Tests**: Ensure your changes include appropriate tests
3. **Check Code Quality**: Run linting and formatting tools
4. **Rebase**: Rebase your branch on the latest main
5. **Create PR**: Submit a detailed pull request

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Breaking change
- [ ] Performance improvement

## Testing

- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. All PRs require at least one review
2. CI checks must pass
3. Documentation must be updated for new features
4. Breaking changes require special approval

## Coding Standards

### JavaScript/TypeScript

- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Use **Prettier** for code formatting
- Follow React best practices and hooks guidelines

### Python (Backend APIs)

- Follow **PEP 8** style guide
- Use **type hints** for all functions
- Use **Black** for code formatting
- Follow **FastAPI** best practices

### General Guidelines

- Write self-documenting code with clear variable names
- Add comments for complex business logic
- Keep functions small and focused
- Use consistent naming conventions
- Handle errors gracefully with proper logging

### File Organization

- Keep related files together
- Use index files for clean imports
- Separate concerns (UI, logic, data)
- Follow established folder structures

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General questions, ideas
- **Pull Request Comments**: Code-specific discussions

### Documentation

- **README.md**: Project overview and setup
- **Technical Docs**: In `/docs` folder (if available)
- **API Documentation**: Generated from code comments
- **Architecture Diagrams**: In project wiki

### Common Issues

**Environment Setup Problems:**

- Check Docker is running: `docker --version`
- Verify Node.js version: `node --version` (should be 20+)
- Clear node_modules: `rm -rf node_modules && npm install`

**Database Connection Issues:**

- Ensure PostgreSQL service is running: `docker-compose ps`
- Check database credentials in `.env`
- Verify port 5433 is available: `lsof -i :5433`

**Frontend Build Issues:**

- Clear Next.js cache: `rm -rf .next`
- Update dependencies: `npm update`
- Check for TypeScript errors: `npm run type-check`

## Recognition

Contributors will be recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Project documentation for major features

Thank you for contributing to MakrX Ecosystem! 🚀
