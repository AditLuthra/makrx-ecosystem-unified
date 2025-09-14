// Deprecated: use useAuthHeaders() from '@makrx/auth' directly within React components.
export function getAuthHeaders(base: Record<string, string> = {}) {
  if (typeof window !== 'undefined' && (window as any).console) {
    console.warn('Deprecated: getAuthHeaders from apps/makrcave/lib/auth.ts. Use useAuthHeaders() hook from @makrx/auth instead.');
  }
  return { ...base };
}
