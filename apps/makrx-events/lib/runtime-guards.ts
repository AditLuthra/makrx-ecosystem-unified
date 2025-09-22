// Utility to check runtime environment and provide safe guards for DB/Keycloak usage
export function isMockMode() {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
}

export function isDbAvailable() {
  return !!process.env.DATABASE_URL;
}

export function isKeycloakConfigured() {
  return (
    !!process.env.KEYCLOAK_BASE_URL &&
    !!process.env.KEYCLOAK_REALM &&
    !!process.env.KEYCLOAK_CLIENT_ID
  );
}

// Use this to wrap DB calls in API routes/pages
export async function safeDbCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (isMockMode() || !isDbAvailable()) {
    return fallback;
  }
  try {
    return await fn();
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('DB call failed, using fallback:', e);
    }
    return fallback;
  }
}
