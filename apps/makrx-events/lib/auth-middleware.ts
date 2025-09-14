import { NextRequest, NextResponse } from 'next/server';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
  };
}

async function verifyKeycloakToken(token: string): Promise<any> {
  try {
    // Get Keycloak public key and verify token
    const keycloakUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`;
    
    // For development - simple decode (in production, verify signature)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    
    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    throw new Error('Token verification failed');
  }
}

export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                 request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyKeycloakToken(token);
    
    if (!payload.sub) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Add user info to request
    (request as AuthenticatedRequest).user = {
      id: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      roles: payload.realm_access?.roles || []
    };

    return null; // Success, continue to route handler
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

export async function requireRole(role: string) {
  return async function(request: NextRequest): Promise<NextResponse | null> {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const user = (request as AuthenticatedRequest).user;
    if (!user?.roles?.includes(role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return null;
  };
}

export function optionalAuth(request: NextRequest): void {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                 request.cookies.get('access_token')?.value;

    if (token) {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        
        if (payload.sub && payload.exp > Math.floor(Date.now() / 1000)) {
          (request as AuthenticatedRequest).user = {
            id: payload.sub,
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            roles: payload.realm_access?.roles || []
          };
        }
      }
    }
  } catch (error) {
    // Silent fail for optional auth
    console.debug('Optional auth failed:', error);
  }
}