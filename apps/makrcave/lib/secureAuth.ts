/**
 * Secure Authentication with Keycloak
 * Implements httpOnly cookies and secure token handling
 */

import Keycloak, { KeycloakInstance } from 'keycloak-js';

// Configuration
// Defaults align with local dev infrastructure (docker-compose):
// - Keycloak at http://localhost:8081
// - Realm "makrx"
// - Client ID "makrcave" (matches backend KEYCLOAK_CLIENT_ID for audience checks)
const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081';
const REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'makrx';
const CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'makrcave-api';

export interface SecureUser {
  sub: string;
  email: string;
  name: string;
  preferred_username: string;
  email_verified: boolean;
  roles: string[];
  scopes: string[];
}

class SecureAuthService {
  private keycloak: KeycloakInstance | null = null;
  private initialized = false;

  async initialize(): Promise<KeycloakInstance> {
    if (this.keycloak && this.initialized) {
      return this.keycloak;
    }

    this.keycloak = new Keycloak({
      url: KEYCLOAK_URL,
      realm: REALM,
      clientId: CLIENT_ID,
    });

    try {
      // Initialize with secure options
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: 'S256', // Use PKCE for security
        enableLogging: process.env.NODE_ENV === 'development',
        checkLoginIframe: true,
        checkLoginIframeInterval: 5,
      });

      if (authenticated) {
        // Set up token refresh
        this.setupTokenRefresh();
      }

      this.initialized = true;
      return this.keycloak;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      throw error;
    }
  }

  private setupTokenRefresh(): void {
    if (!this.keycloak) return;

    // Refresh token when it's about to expire (5 minutes before)
    setInterval(async () => {
      try {
        if (this.keycloak?.isTokenExpired(300)) {
          // 5 minutes
          await this.keycloak.updateToken(300);
          console.log('Token refreshed successfully');
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Redirect to login if refresh fails
        await this.login();
      }
    }, 60000); // Check every minute
  }

  async login(): Promise<void> {
    if (!this.keycloak) {
      await this.initialize();
    }

    try {
      await this.keycloak?.login({
        redirectUri: window.location.origin + '/auth-callback',
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (!this.keycloak) return;

    try {
      await this.keycloak.logout({
        redirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.keycloak?.authenticated || false;
  }

  getUser(): SecureUser | null {
    if (!this.keycloak?.authenticated || !this.keycloak.tokenParsed) {
      return null;
    }

    const token = this.keycloak.tokenParsed as any;

    return {
      sub: token.sub,
      email: token.email || '',
      name: token.name || token.preferred_username || '',
      preferred_username: token.preferred_username || '',
      email_verified: token.email_verified || false,
      roles: token.realm_access?.roles || [],
      scopes: token.scope?.split(' ') || [],
    };
  }

  async getToken(): Promise<string | null> {
    if (!this.keycloak?.authenticated) {
      return null;
    }

    try {
      // Ensure token is valid
      await this.keycloak.updateToken(30);
      return this.keycloak.token || null;
    } catch (error) {
      console.error('Failed to get valid token:', error);
      return null;
    }
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.roles.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    return roles.some((role) => user?.roles.includes(role)) || false;
  }

  // Secure API request helper
  async secureRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getToken();

    if (!token) {
      throw new Error('No valid authentication token available');
    }

    const secureOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, secureOptions);

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        console.warn('API request unauthorized, attempting to refresh token...');
        await this.keycloak?.updateToken(-1); // Force refresh

        const newToken = await this.getToken();
        if (newToken) {
          secureOptions.headers = {
            ...secureOptions.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return fetch(url, secureOptions);
        } else {
          // If we can't get a token, redirect to login
          await this.login();
          throw new Error('Authentication required');
        }
      }

      return response;
    } catch (error) {
      console.error('Secure request failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const secureAuth = new SecureAuthService();

// Helper hook for React components
export const useSecureAuth = () => {
  return {
    login: () => secureAuth.login(),
    logout: () => secureAuth.logout(),
    isAuthenticated: () => secureAuth.isAuthenticated(),
    getUser: () => secureAuth.getUser(),
    hasRole: (role: string) => secureAuth.hasRole(role),
    hasAnyRole: (roles: string[]) => secureAuth.hasAnyRole(roles),
    secureRequest: (url: string, options?: RequestInit) => secureAuth.secureRequest(url, options),
  };
};

export default secureAuth;
