import { createRemoteJWKSet, JWTPayload, jwtVerify } from 'jose';
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

type KeycloakJwtPayload = JWTPayload & {
  email?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  realm_access?: {
    roles?: string[];
  };
};

const keycloakIssuer =
  process.env.KEYCLOAK_BASE_URL && process.env.KEYCLOAK_REALM
    ? `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}`
    : null;

const keycloakJwks = keycloakIssuer
  ? createRemoteJWKSet(new URL(`${keycloakIssuer}/protocol/openid-connect/certs`))
  : null;

async function verifyKeycloakToken(token: string): Promise<KeycloakJwtPayload> {
  if (!keycloakIssuer || !keycloakJwks) {
    throw new Error('Keycloak environment not fully configured');
  }

  if (!process.env.KEYCLOAK_CLIENT_ID) {
    throw new Error('KEYCLOAK_CLIENT_ID is not set');
  }

  try {
    const { payload } = await jwtVerify(token, keycloakJwks, {
      issuer: keycloakIssuer,
      audience: process.env.KEYCLOAK_CLIENT_ID,
      clockTolerance: 30,
    });

    // Defensive: ensure sub is a string
    if (!payload || typeof payload.sub !== 'string') {
      throw new Error('Missing or invalid subject claim');
    }

    return payload as KeycloakJwtPayload;
  } catch (error) {
    throw new Error('Token verification failed');
  }
}

export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = await verifyKeycloakToken(token);

    // Add user info to request
    (request as AuthenticatedRequest).user = {
      id: payload.sub as string,
      email: payload.email || payload.preferred_username || '',
      firstName: payload.given_name,
      lastName: payload.family_name,
      roles: payload.realm_access?.roles || [],
    };

    return null; // Success, continue to route handler
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

export async function requireRole(role: string) {
  return async function (request: NextRequest): Promise<NextResponse | null> {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const user = (request as AuthenticatedRequest).user;
    if (!user?.roles?.includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return null;
  };
}

export async function optionalAuth(request: NextRequest): Promise<void> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('access_token')?.value;

    if (!token) {
      return;
    }

    const payload = await verifyKeycloakToken(token);

    (request as AuthenticatedRequest).user = {
      id: payload.sub as string,
      email: payload.email || payload.preferred_username || '',
      firstName: payload.given_name,
      lastName: payload.family_name,
      roles: payload.realm_access?.roles || [],
    };
  } catch (error) {
    // Silent fail for optional auth
    console.debug('Optional auth failed:', error);
  }
}
