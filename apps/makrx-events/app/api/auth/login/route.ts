import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect to Keycloak login
  const keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL;
  const realm = process.env.KEYCLOAK_REALM;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  if (!keycloakBaseUrl || !realm || !clientId) {
    return NextResponse.json(
      { error: 'Authentication service not configured' },
      { status: 500 }
    );
  }

  const authUrl = new URL(`${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/auth`);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');

  return NextResponse.redirect(authUrl.toString());
}