# Changelog

All notable changes to MakrX.events will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive documentation suite
- Contributing guidelines and code of conduct
- Security policy and vulnerability reporting
- Environment configuration examples
- API schema validation fixes

### Fixed

- Database schema field mismatches (startDate→startsAt, endDate→endsAt)
- TypeScript compilation errors throughout platform
- API route parameter validation

### Changed

- Consolidated authentication to Keycloak exclusively
- Improved project structure documentation

## [1.0.0-beta] - 2025-01-20

### Added

- Complete platform rebuild with Next.js 15
- Keycloak authentication integration
- Event management system
- Registration and payment processing
- Real-time WebSocket features
- Tournament management system
- QR code check-in functionality
- Admin dashboard and analytics
- Microsite architecture for events
- Role-based access control
- Email notification system
- Database schema with Drizzle ORM
- Comprehensive API endpoints

### Technical

- Next.js 15 with App Router
- TypeScript throughout
- PostgreSQL with Drizzle ORM
- Tailwind CSS with shadcn/ui
- Keycloak OIDC authentication
- WebSocket server integration
- Stripe payment processing
- SMTP email integration

### Infrastructure

- Docker containerization
- Environment-based configuration
- Health checks and monitoring
- Rate limiting and security

## [0.x.x] - Legacy

### Deprecated

- Express.js backend (replaced with Next.js API routes)
- React/Vite frontend (migrated to Next.js)
- Custom authentication (replaced with Keycloak)
- Memory storage (replaced with PostgreSQL)

---

## Version Guidelines

### Major Version (x.0.0)

- Breaking API changes
- Database schema breaking changes
- Authentication system changes
- Major architecture changes

### Minor Version (0.x.0)

- New features and endpoints
- Non-breaking API additions
- New components and pages
- Performance improvements

### Patch Version (0.0.x)

- Bug fixes
- Security patches
- Documentation updates
- Dependency updates

## Migration Guide

### From 0.x.x to 1.x.x

**Breaking Changes:**

- Complete platform rebuild - fresh installation required
- Authentication moved from custom to Keycloak
- API endpoints restructured
- Database schema completely redesigned

**Migration Steps:**

1. Export existing data (if any)
2. Set up new environment with 1.x.x
3. Configure Keycloak authentication
4. Import/recreate data in new schema
5. Update any integrations to use new API

**New Requirements:**

- Keycloak server for authentication
- PostgreSQL database
- Updated environment variables

---

For detailed information about any release, see the [GitHub Releases](https://github.com/your-org/makrx-events/releases) page.
