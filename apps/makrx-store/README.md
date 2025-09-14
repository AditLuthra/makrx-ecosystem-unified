# Makrx Store - MakrX Ecosystem

## 🚀 Quick Start

### Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your specific configuration
```

### Development Mode
```bash
npm run dev
```

### API Integration

#### Real Backend API (Recommended)
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8003
```

#### Mock Data (Development/Demo)
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### Authentication
This app uses Keycloak SSO integration via the `@makrx/auth` package.

Recommended: standardized auth headers built from context

```ts
import { useAuthHeaders } from '@makrx/auth';

function Example() {
  const getHeaders = useAuthHeaders();

  async function load() {
    const headers = await getHeaders({ 'Content-Type': 'application/json' });
    const res = await fetch('/api/feature-flags', { headers });
  }
}
```

Avoid reading tokens directly from localStorage; always use the provider.

## 🏗️ Backend Integration

The frontend integrates with the makrx-store backend API:
- Health: `GET /health`
- API Docs: `GET /docs` (FastAPI backends)
- API Base: `/api/`

### API Client
The API client (`src/lib/api.ts`) automatically handles:
- JWT token authentication
- Request/response serialization
- Error handling and retries
- Fallback to mock data on network errors
