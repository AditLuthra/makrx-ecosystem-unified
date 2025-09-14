import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AuthConfig } from './types';

export function createNextAuthConfig(config: AuthConfig): NextAuthOptions {
  return {
    providers: [
      {
        id: 'keycloak',
        name: 'Keycloak',
        type: 'oauth',
        wellKnown: `${config.keycloakUrl}/realms/${config.realm}/.well-known/openid_configuration`,
        authorization: {
          params: {
            scope: 'openid email profile',
          },
        },
        clientId: config.clientId,
        clientSecret: config.clientSecret!,
        idToken: true,
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name ?? `${profile.given_name} ${profile.family_name}`,
            email: profile.email,
            image: profile.picture,
            roles: profile.realm_access?.roles || [],
          };
        },
      },
    ],
    callbacks: {
      async jwt({ token, account, profile }): Promise<JWT> {
        if (account) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = account.expires_at;
          token.roles = (profile as any)?.realm_access?.roles || [];
        }

        // Return previous token if the access token has not expired yet
        if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
          return token;
        }

        // Access token has expired, try to update it
        return await refreshAccessToken(token, config);
      },
      async session({ session, token }) {
        session.user = {
          ...session.user,
          id: token.sub!,
          roles: token.roles as string[],
        };
        session.accessToken = token.accessToken as string;
        session.error = token.error as string;

        return session;
      },
    },
    events: {
      async signOut({ token }) {
        if (token.refreshToken) {
          try {
            const response = await fetch(
              `${config.keycloakUrl}/realms/${config.realm}/protocol/openid-connect/logout`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  client_id: config.clientId,
                  client_secret: config.clientSecret!,
                  refresh_token: token.refreshToken as string,
                }),
              }
            );
            
            if (!response.ok) {
              throw new Error('Failed to logout from Keycloak');
            }
          } catch (error) {
            console.error('Error logging out from Keycloak:', error);
          }
        }
      },
    },
  };
}

async function refreshAccessToken(token: JWT, config: AuthConfig): Promise<JWT> {
  try {
    const response = await fetch(
      `${config.keycloakUrl}/realms/${config.realm}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret!,
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken as string,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const refreshedTokens = await response.json();

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles?: string[];
    };
  }

  interface User {
    roles?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    roles?: string[];
    error?: string;
  }
}