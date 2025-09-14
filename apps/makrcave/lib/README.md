# Library Utilities

## Overview

The `lib` directory contains utility functions, configuration, and helper modules that are used throughout the MakrCave application.

## Core Utilities

### `utils.ts`

General utility functions and helpers:

- `cn()` - Tailwind CSS class name utility with clsx
- `formatCurrency()` - Currency formatting
- `formatDate()` - Date/time formatting
- `debounce()` - Function debouncing
- `throttle()` - Function throttling

```typescript
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const className = cn('base-class', condition && 'conditional-class');
const price = formatCurrency(1234.56, 'USD'); // "$1,234.56"
const date = formatDate(new Date(), 'MMM dd, yyyy'); // "Jan 15, 2025"
```

### `auth.ts`

Authentication utilities and helpers:

- Token management
- User role verification
- Permission checking
- Session handling

```typescript
import auth from '@/lib/auth';

const isAuthenticated = auth.isAuthenticated();
const user = auth.getCurrentUser();
const hasPermission = auth.hasPermission('equipment:write');
```

### `roleRedirect.ts`

Role-based navigation and redirects:

- Route protection logic
- Role-based redirects
- Permission-based navigation

```typescript
import { roleRedirect } from '@/lib/roleRedirect';

const redirectPath = roleRedirect(user.role, currentPath);
if (redirectPath) {
  router.push(redirectPath);
}
```

### `sso-utils.ts`

Single Sign-On utilities:

- Keycloak integration helpers
- Token validation
- SSO configuration

### `userUtils.ts`

User-related utility functions:

- User data formatting
- Avatar generation
- Display name formatting
- Role management

```typescript
import { getUserDisplayName, generateAvatar } from '@/lib/userUtils';

const displayName = getUserDisplayName(user);
const avatarUrl = generateAvatar(user.email);
```

## Configuration Files

### Type Definitions

Shared TypeScript interfaces and types:

- API response types
- Component prop interfaces
- Business logic types

### Constants

Application constants and configuration:

- API endpoints
- Default values
- Error messages
- Feature flags

## Validation & Schemas

### Form Validation

Reusable validation schemas:

```typescript
import { z } from 'zod';

export const memberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['member', 'manager', 'admin']),
});
```

### API Validation

Request/response validation schemas:

```typescript
export const equipmentResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['available', 'in-use', 'maintenance']),
  location: z.string(),
});
```

## Performance Utilities

### Memoization Helpers

```typescript
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};
```

### Async Utilities

```typescript
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const retry = async <T>(fn: () => Promise<T>, attempts: number = 3): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts > 1) {
      await delay(1000);
      return retry(fn, attempts - 1);
    }
    throw error;
  }
};
```

## Error Handling

### Error Utilities

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: any) => {
  if (error.response) {
    throw new AppError(
      error.response.data.message,
      error.response.data.code,
      error.response.status,
    );
  }

  throw new AppError('Network error', 'NETWORK_ERROR', 0);
};
```

## Browser Utilities

### Local Storage Helpers

```typescript
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
};
```

### URL Utilities

```typescript
export const urlUtils = {
  buildQuery: (params: Record<string, any>): string => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query.append(key, String(value));
      }
    });
    return query.toString();
  },

  parseQuery: (search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },
};
```

## Testing Utilities

### Test Helpers

```typescript
export const testUtils = {
  createMockUser: (overrides = {}) => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'member',
    ...overrides,
  }),

  createMockEquipment: (overrides = {}) => ({
    id: '1',
    name: 'Test Equipment',
    status: 'available',
    location: 'Lab A',
    ...overrides,
  }),
};
```

## Usage Guidelines

### Import Patterns

```typescript
// Specific imports (preferred)
import { cn, formatCurrency } from '@/lib/utils';
import auth from '@/lib/auth';

// Avoid namespace imports unless necessary
import * as utils from '@/lib/utils'; // Only when needed
```

### Performance Considerations

- Import only what you need
- Use tree-shaking friendly exports
- Memoize expensive computations
- Cache frequently used values

### Type Safety

- Export proper TypeScript types
- Use generic functions where applicable
- Provide runtime type checking for critical functions

## Contributing

When adding new utilities:

1. Follow established patterns
2. Include proper TypeScript types
3. Add unit tests
4. Document usage examples
5. Consider bundle size impact
