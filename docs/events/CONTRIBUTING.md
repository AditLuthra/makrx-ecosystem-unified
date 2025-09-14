# Contributing to MakrX.events

Thank you for your interest in contributing to MakrX.events! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [support@makrx.events](mailto:support@makrx.events).

## 🚀 Quick Start for Contributors

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
git clone https://github.com/your-username/makrx-events.git
cd makrx-events
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:push

# Start development server
npm run dev
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

## 📋 Development Workflow

### Before Making Changes

1. **Check existing issues** - Look for related issues or discussions
2. **Create an issue** - For new features or major changes, create an issue first
3. **Discuss your approach** - Get feedback on your proposed solution

### Making Changes

1. **Follow coding standards**
   - Use TypeScript for all new code
   - Follow existing code conventions
   - Use meaningful variable and function names
   - Add proper error handling

2. **Write tests**
   - Add unit tests for new functions
   - Add integration tests for API endpoints
   - Update existing tests if needed

3. **Update documentation**
   - Update README.md if needed
   - Add inline code comments
   - Update API documentation

### Code Style Guidelines

#### TypeScript/JavaScript
```typescript
// Use explicit types
interface UserData {
  id: string;
  email: string;
  firstName?: string;
}

// Use descriptive function names
async function fetchUserRegistrations(userId: string): Promise<Registration[]> {
  // Implementation
}

// Handle errors properly
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API call failed:', error);
  throw new Error('Failed to fetch data');
}
```

#### React Components
```tsx
// Use TypeScript interfaces for props
interface EventCardProps {
  event: Event;
  onRegister: (eventId: string) => void;
}

// Use descriptive component names
export function EventRegistrationCard({ event, onRegister }: EventCardProps) {
  // Component implementation
}

// Use proper error boundaries
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Error boundary implementation
}
```

#### Database Schema
```typescript
// Use descriptive table and column names
export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("confirmed"),
  registeredAt: timestamp("registered_at").defaultNow(),
});
```

### Testing Guidelines

#### Unit Tests
```typescript
import { describe, it, expect } from 'vitest';
import { validateEmail } from '@/lib/utils';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});
```

#### API Tests
```typescript
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '@/app/api/events/route';

describe('/api/events', () => {
  it('should return events list', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      },
    });
  });
});
```

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:debug        # Start with debugging enabled

# Building
npm run build           # Build for production
npm run start          # Start production server

# Database
npm run db:push        # Push schema changes
npm run db:push --force # Force push schema changes
npm run db:generate    # Generate migrations

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint errors
npm run type-check     # Run TypeScript compiler
npm run format         # Format code with Prettier

# Testing
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:e2e      # Run end-to-end tests
npm run test:coverage # Run tests with coverage
```

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples
```bash
feat(auth): add Keycloak integration
fix(events): resolve registration payment bug
docs(api): update authentication endpoints
refactor(components): extract reusable event card
test(api): add integration tests for events API
```

## 🧪 Testing Your Changes

### Before Submitting

1. **Run the test suite**
   ```bash
   npm test
   ```

2. **Check code quality**
   ```bash
   npm run lint
   npm run type-check
   ```

3. **Test manually**
   - Test your changes in the browser
   - Test on mobile devices
   - Test with different user roles

4. **Check for breaking changes**
   - Ensure existing functionality still works
   - Test with different data scenarios

## 📤 Submitting Changes

### Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a pull request**
   - Use a descriptive title
   - Fill out the PR template
   - Link related issues
   - Add screenshots for UI changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Screenshots
(If applicable)

## Related Issues
Closes #123
```

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** - Check if the bug has already been reported
2. **Try the latest version** - Ensure you're using the most recent code
3. **Minimal reproduction** - Create a minimal example that reproduces the bug

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Browser: [e.g., Chrome 91]
- OS: [e.g., macOS 11.4]
- Node.js version: [e.g., 16.14.0]

## Additional Context
Any other relevant information
```

## 💡 Suggesting Features

### Feature Request Process

1. **Check existing requests** - Look for similar feature requests
2. **Create a detailed issue** - Use the feature request template
3. **Discuss the approach** - Engage in discussion about implementation

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this feature work?

## Alternative Solutions
Other approaches considered

## Additional Context
Any other relevant information
```

## 🏗️ Architecture Guidelines

### File Organization

```
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── (auth)/            # Authentication pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── shared/               # Shared types and schemas
└── server/               # Server utilities
```

### Component Guidelines

1. **Single Responsibility** - Each component should have one clear purpose
2. **Composition over Inheritance** - Use composition patterns
3. **Props Interface** - Always define TypeScript interfaces for props
4. **Error Boundaries** - Wrap components that might error
5. **Loading States** - Handle loading and error states properly

### API Guidelines

1. **RESTful Design** - Follow REST conventions
2. **Error Handling** - Return consistent error responses
3. **Validation** - Validate all input data
4. **Authentication** - Secure all protected endpoints
5. **Documentation** - Document all endpoints

## 🔒 Security Guidelines

### General Security

1. **Input Validation** - Validate all user input
2. **SQL Injection** - Use parameterized queries
3. **XSS Prevention** - Sanitize user content
4. **CSRF Protection** - Use CSRF tokens
5. **Authentication** - Secure authentication flow

### API Security

```typescript
// Input validation
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

// Error handling
try {
  const validatedData = schema.parse(requestBody);
  // Process request
} catch (error) {
  return NextResponse.json(
    { error: 'Invalid input' },
    { status: 400 }
  );
}
```

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/)

### Tools
- [VS Code Extensions](https://code.visualstudio.com/docs/languages/typescript)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Postman](https://www.postman.com/) - API testing

### Community
- [GitHub Discussions](https://github.com/your-org/makrx-events/discussions)
- [Discord Server](https://discord.gg/makrx-events) (if available)

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

## ❓ Getting Help

### Where to Ask Questions

1. **GitHub Discussions** - General questions and ideas
2. **GitHub Issues** - Bug reports and feature requests
3. **Email** - [support@makrx.events](mailto:support@makrx.events)

### Response Times

- **Bug reports**: 2-3 business days
- **Feature requests**: 1 week
- **Pull requests**: 3-5 business days
- **Security issues**: 24 hours

Thank you for contributing to MakrX.events! 🚀