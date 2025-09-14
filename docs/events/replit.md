# MakrX.events Event Management Platform

## Overview

MakrX.events is a full-stack event management platform designed for the maker community. The platform enables users to discover, create, and manage maker events such as workshops, competitions, and exhibitions. Built with modern web technologies, it provides a comprehensive solution for event organizers and participants to connect and collaborate.

**RECENTLY REBUILT**: The application has been completely restructured from React/Vite + Express to Next.js full-stack architecture. The platform now uses Next.js 15 with App Router, maintains the same PostgreSQL database with Drizzle ORM, and integrated Replit authentication. The platform supports event creation, registration management, payment processing with Stripe (to be integrated), and feature flag-based customization for different event types.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router and TypeScript
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **State Management**: TanStack Query for server state management
- **Routing**: Next.js App Router (file-based routing)
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Next.js API Routes (serverless functions)
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses using Next.js route handlers
- **Middleware**: Next.js middleware for session management and authentication
- **Build System**: Next.js optimized bundling

### Database Design
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema**: Event management entities including users, events, registrations, activities, and feature flags
- **Session Storage**: PostgreSQL-based session store for authentication

### Authentication System
- **Provider**: Keycloak OpenID Connect (OIDC) integration 
- **Session Management**: HTTP-only cookies with JWT tokens
- **Security**: Token-based authentication with role-based access control
- **Authorization**: Role-based permissions (user, event_admin, super_admin)

### Feature Flag System
- **Implementation**: Database-driven feature flags per event
- **Purpose**: Dynamic UI customization based on event types (workshops, competitions, exhibitions)
- **Architecture**: React context-based feature flag provider with real-time updates

### Development Environment
- **Development Server**: Vite dev server with HMR and error overlay
- **Static Assets**: Vite handles asset bundling and optimization
- **Environment**: Replit-specific plugins for cartographer and runtime error handling

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OIDC authentication service
- **Session Storage**: PostgreSQL with connect-pg-simple adapter

### Payment Processing
- **Stripe Integration**: Stripe React components and JavaScript SDK
- **Payment Features**: Event registration payments with payment intent tracking

### UI and Styling
- **Component Library**: Radix UI for accessible, unstyled components
- **Design System**: Tailwind CSS with custom color palette and component variants
- **Icons**: Lucide React icon library

### Development Tools
- **Build Tools**: Vite, ESBuild, TypeScript compiler
- **Validation**: Zod schema validation for forms and API endpoints
- **Development**: Replit-specific development plugins and error handling

### Fonts and Assets
- **Typography**: Google Fonts integration (DM Sans, Fira Code, Geist Mono, Architects Daughter)
- **Images**: Unsplash for demo event images and placeholders