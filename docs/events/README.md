# MakrX.events - Event Management Platform

A comprehensive, open-source event management platform designed for maker events, technical festivals, workshops, competitions, and exhibitions. Built with modern web technologies and designed for scalability.

![MakrX.events](https://img.shields.io/badge/MakrX-events-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Features

### Core Platform
- **Event Management**: Create, manage, and promote technical events
- **Registration System**: Streamlined attendee registration with payment processing
- **Real-time Updates**: Live leaderboards, notifications, and tournament updates
- **Multi-format Events**: Support for workshops, competitions, exhibitions, and hybrid events

### Advanced Features
- **Tournament Management**: Bracket generation, scoring systems, and live updates
- **Team Formation**: Team creation, management, and communication tools
- **Payment Processing**: Integrated Razorpay payment gateway with webhook verification
- **Communication**: Bulk email system, push notifications, and live announcements
- **Analytics**: Real-time dashboard with comprehensive event metrics
- **QR Code Integration**: Check-in system and session management

### Technical Features
- **Authentication**: Keycloak integration with role-based access control
- **Real-time Communication**: WebSocket server for live updates
- **API Documentation**: OpenAPI/Swagger documentation
- **Monitoring**: Health checks, metrics, and application monitoring
- **Responsive Design**: Mobile-first design optimized for all devices

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with App Router and TypeScript
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state
- **Real-time**: WebSocket client for live updates

### Backend
- **Runtime**: Node.js with TypeScript
- **API**: Next.js API routes with RESTful design
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Keycloak OpenID Connect
- **Payments**: Razorpay integration
- **Real-time**: WebSocket server for live features

### Infrastructure
- **Database**: Neon PostgreSQL (serverless)
- **Storage**: File upload system with organized structure
- **Email**: SMTP integration with template system
- **Monitoring**: Health checks and metrics collection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Keycloak server (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/makrx-events.git
   cd makrx-events
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Web Application: http://localhost:5000
   - API Documentation: http://localhost:5000/api/docs
   - Health Check: http://localhost:5000/api/health

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/makrx_events

# Authentication (Keycloak)
KEYCLOAK_BASE_URL=https://your-keycloak-server.com
KEYCLOAK_REALM=makrx-events
KEYCLOAK_CLIENT_ID=makrx-events-client
KEYCLOAK_CLIENT_SECRET=your-client-secret

# Payments (Razorpay)
VITE_RAZORPAY_KEY_ID=rzp_test_your-key-id
RAZORPAY_KEY_SECRET=your-secret-key
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@makrx.events

# Application
SESSION_SECRET=your-secure-session-secret-32-chars-min
NEXT_PUBLIC_APP_URL=http://localhost:5000
```

### Keycloak Setup

1. Create a realm named `makrx-events`
2. Create a client with:
   - Client ID: `makrx-events-client`
   - Client authentication: ON
   - Valid redirect URIs: `http://localhost:5000/*`
   - Web origins: `http://localhost:5000`

## 🌐 Deployment

### Docker Deployment

```bash
# Build the Docker image
docker build -t makrx-events .

# Run with Docker Compose
docker-compose up -d
```

### Cloud Deployment

#### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Railway
1. Create a new project on Railway
2. Connect your GitHub repository
3. Add environment variables
4. Deploy with one click

#### AWS/GCP/Azure
- Use the provided `Dockerfile` for containerized deployment
- Set up a managed PostgreSQL database
- Configure environment variables
- Set up load balancer and SSL certificate

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure session secret
- [ ] Set up SSL certificates
- [ ] Configure production database
- [ ] Set up Keycloak production instance
- [ ] Configure payment gateway
- [ ] Set up monitoring and logging
- [ ] Configure email service
- [ ] Set up backup strategy

## 📖 API Documentation

Interactive API documentation is available at `/api/docs` when running the application.

### Key Endpoints

- `GET /api/health` - Application health check
- `GET /api/auth/user` - Get current user
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/my-registrations` - User registrations
- `GET /api/platform-stats` - Platform statistics

### WebSocket API

Connect to `/ws` for real-time features:

```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

// Subscribe to event updates
ws.send(JSON.stringify({
  type: 'subscribe',
  data: { channel: 'event:123' }
}));

// Receive real-time updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Real-time update:', message);
};
```

## 🧪 Development

### Database Management

```bash
# Push schema changes
npm run db:push

# Force push schema changes
npm run db:push --force

# Generate migrations (if needed)
npm run db:generate
```

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Community Support
- **Documentation**: [docs.makrx.events](https://docs.makrx.events)
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/makrx-events/issues)
- **Discussions**: [Community discussions](https://github.com/your-org/makrx-events/discussions)

### Commercial Support
For enterprise support, custom development, and consulting services, contact us at [support@makrx.events](mailto:support@makrx.events).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Radix UI](https://www.radix-ui.com/) - Low-level UI primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Keycloak](https://www.keycloak.org/) - Identity and access management

## 🔗 Links

- **Website**: [makrx.events](https://makrx.events)
- **Documentation**: [docs.makrx.events](https://docs.makrx.events)
- **GitHub**: [github.com/your-org/makrx-events](https://github.com/your-org/makrx-events)

---

Made with ❤️ for the maker community