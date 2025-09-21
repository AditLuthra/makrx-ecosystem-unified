import { useAuth } from '@/contexts/AuthContext';

/**
 * Returns an Authorization header with the Bearer token from the Keycloak context, if available.
 * Falls back to empty object if not authenticated or no token.
 */
export function useAuthHeaders(): { Authorization?: string } {
  const { user } = useAuth();
  // Try to get token from user context (extend as needed for your Keycloak integration)
  // @ts-ignore: Keycloak may expose token property
  const token =
    (user && (user as any).token) ||
    (typeof window !== 'undefined' && (window as any).kc?.token) ||
    null;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}
