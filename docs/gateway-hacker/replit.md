# Overview

Makrx.org is a modern makerspace website that showcases a futuristic hacker/maker community platform. The application features a cyberpunk-inspired design with neon aesthetics, 3D background animations, and sections highlighting workshop access, community features, projects, and a store. Built as a full-stack TypeScript application, it combines a React frontend with an Express backend, designed to support future expansion into a comprehensive makerspace management platform.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern component-based architecture using functional components and hooks
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom dark theme variables and cyberpunk color scheme
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **State Management**: React Query (TanStack Query) for server state management
- **3D Graphics**: Three.js integration for animated background elements
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Express.js**: RESTful API server with TypeScript
- **Modular Structure**: Separation of routes, storage, and server setup
- **Storage Abstraction**: Interface-based storage layer with in-memory implementation (ready for database upgrade)
- **Development Tools**: Hot reloading with Vite integration in development mode

## Design System
- **Theme System**: Custom dark/light theme with CSS variables
- **Typography**: JetBrains Mono for code/tech elements, Inter for body text
- **Color Palette**: Cyberpunk-inspired with makr-yellow (#FFEB3B), makr-blue (#00BCD4), and terminal-green (#00FF00)
- **Component Library**: Comprehensive UI component system with consistent styling

## Data Layer
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: User management schema integrated with Keycloak SSO
- **Migrations**: Drizzle-kit for database schema management
- **Connection**: Neon Database serverless PostgreSQL integration

## Authentication Architecture
- **Keycloak SSO**: Complete authentication system using Keycloak for single sign-on
- **Unified Authentication**: Single login across all MakrX ecosystem platforms
- **User Management**: Centralized user profiles and permissions through Keycloak
- **Integration**: Seamless authentication flow between MakrX.org, MakrCave, MakrX Store, MakrX.events, and Service Provider Panel
- **Authentication URLs**: 
  - Login: https://auth.makrx.org/login
  - Registration: https://auth.makrx.org/register
  - Dashboard: Integrated user profile management and preferences

## Development Environment
- **Replit Integration**: Configured for Replit development environment with runtime error handling
- **TypeScript**: Strict type checking across frontend, backend, and shared modules
- **Path Aliases**: Clean import paths using @ aliases for better developer experience
- **Hot Reloading**: Full-stack development with instant feedback

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting via @neondatabase/serverless
- **Drizzle ORM**: Type-safe database operations and schema management

## UI Framework
- **Radix UI**: Comprehensive set of accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Modern build tool with hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Frontend Libraries
- **React Query**: Server state management and data fetching
- **Wouter**: Lightweight routing solution
- **Three.js**: 3D graphics library for background animations
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date manipulation utilities

## Styling and Animation
- **Font Awesome**: Icon library for decorative elements
- **Google Fonts**: JetBrains Mono and Inter font families
- **Class Variance Authority**: Type-safe component variants
- **Clsx**: Conditional className utility

## Backend Infrastructure
- **Express.js**: Web application framework
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Zod**: Runtime type validation for API schemas

# Recent Changes

## August 24, 2025 - Authentication Integration & User Dashboard
- Updated documentation to include Keycloak SSO authentication architecture
- Added comprehensive user dashboard page (/dashboard) with profile management
- Integrated Keycloak authentication URLs (auth.makrx.org/login, auth.makrx.org/register)
- Created user profile editing functionality with role selection
- Added activity tracking and ecosystem platform access links
- Updated navigation to include Dashboard link
- Documented unified authentication across all MakrX ecosystem platforms
- Added MakrX.events integration in navigation launcher and home page section

## August 23, 2025 - MakrX.org Landing Page Complete
- Built complete futuristic hacker/maker-style landing page
- Implemented cyberpunk design with Makr Yellow, Makr Blue, Terminal Green color scheme
- Added 3D animated background with floating geometric shapes using Three.js
- Created typewriter effect for "Dream. Make. Share." tagline
- Built responsive sections: Hero, About, Projects showcase, Store preview
- Added interactive navigation with smooth scrolling
- Implemented dark/light theme toggle system
- Added console easter eggs (IAmAMaker() and makrStatus() functions)
- Included glitch hover effects and neon border animations
- Successfully deployed and running on port 5000