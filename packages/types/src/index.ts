// User types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
}

// API types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth types (from auth package)
export interface MakrXUser {
  id: string;
  keycloakId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  roles: string[];
  organizations: UserOrganization[];
}

export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
}

export interface AuthConfig {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  clientSecret?: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  preferred_username: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: MakrXUser | null;
  token: string | null;
  refreshToken: string | null;
}

export type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: MakrXUser; token: string; refreshToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN'; payload: { token: string; refreshToken: string } }
  | { type: 'UPDATE_USER'; payload: Partial<MakrXUser> };

// Roles used across admin views
export type UserRole = 'super_admin' | 'admin' | 'makerspace_admin' | 'service_provider' | 'user';
