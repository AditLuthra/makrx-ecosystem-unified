import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Clear token cookie and redirect to Keycloak logout
  const keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL;
  const realm = process.env.KEYCLOAK_REALM;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL;

  if (!keycloakBaseUrl || !realm || !clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Authentication service not configured' },
      { status: 500 }
    );
  }

  const logoutUrl = new URL(`${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/logout`);
  logoutUrl.searchParams.set('client_id', clientId);
  logoutUrl.searchParams.set('post_logout_redirect_uri', redirectUri);

  const response = NextResponse.redirect(logoutUrl.toString());
  
  // Clear the access token cookie
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0 // Immediately expire
  });

  return response;
}