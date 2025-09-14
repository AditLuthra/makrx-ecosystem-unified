import Keycloak from 'keycloak-js';
import { AuthConfig, MakrXUser, TokenPayload } from './types';

export class MakrXKeycloak {
  private keycloak: Keycloak;
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
    this.keycloak = new Keycloak({
      url: config.keycloakUrl,
      realm: config.realm,
      clientId: config.clientId,
    });
  }

  async init(): Promise<boolean> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
        pkceMethod: 'S256'
      });

      if (authenticated) {
        this.setupTokenRefresh();
      }

      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak', error);
      return false;
    }
  }

  async login(): Promise<void> {
    await this.keycloak.login();
  }

  async logout(): Promise<void> {
    await this.keycloak.logout();
  }

  isAuthenticated(): boolean {
    return this.keycloak.authenticated ?? false;
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  getRefreshToken(): string | undefined {
    return this.keycloak.refreshToken;
  }

  async getUserInfo(): Promise<MakrXUser | null> {
    if (!this.isAuthenticated() || !this.keycloak.tokenParsed) {
      return null;
    }

    try {
      const tokenPayload = this.keycloak.tokenParsed as TokenPayload;
      const userInfo = await this.keycloak.loadUserProfile();

      // Get roles from token
      const realmRoles = tokenPayload.realm_access?.roles || [];
      const clientRoles = tokenPayload.resource_access?.[this.config.clientId]?.roles || [];
      const roles = [...realmRoles, ...clientRoles];

      const avatarUrl: string | undefined = Array.isArray((userInfo as any)?.attributes?.avatar_url)
        ? (userInfo as any).attributes.avatar_url[0]
        : undefined;

      return {
        id: tokenPayload.sub,
        keycloakId: tokenPayload.sub,
        email: tokenPayload.email,
        firstName: userInfo.firstName || tokenPayload.given_name,
        lastName: userInfo.lastName || tokenPayload.family_name,
        avatarUrl,
        roles,
        organizations: [] // Will be populated from API
      };
    } catch (error) {
      console.error('Failed to get user info', error);
      return null;
    }
  }

  async updateToken(minValidity = 30): Promise<boolean> {
    try {
      return await this.keycloak.updateToken(minValidity);
    } catch (error) {
      console.error('Failed to refresh token', error);
      return false;
    }
  }

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role) || this.keycloak.hasResourceRole(role, this.config.clientId);
  }

  private setupTokenRefresh(): void {
    // Set up automatic token refresh
    setInterval(async () => {
      try {
        const refreshed = await this.updateToken(70);
        if (refreshed) {
          console.log('Token refreshed');
        }
      } catch (error) {
        console.error('Failed to refresh token', error);
        // Token refresh failed, redirect to login
        await this.login();
      }
    }, 60000); // Check every minute
  }

  onAuthSuccess(callback: () => void): void {
    this.keycloak.onAuthSuccess = callback;
  }

  onAuthError(callback: (error: any) => void): void {
    this.keycloak.onAuthError = callback;
  }

  onAuthLogout(callback: () => void): void {
    this.keycloak.onAuthLogout = callback;
  }

  onTokenExpired(callback: () => void): void {
    this.keycloak.onTokenExpired = callback;
  }
}
