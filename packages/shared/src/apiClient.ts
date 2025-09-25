import { useCallback } from 'react';

// Example: useAuthHeaders hook for consistent auth header logic
export function useAuthHeaders() {
  // Replace with your actual auth token retrieval logic
  const getToken = () => localStorage.getItem('auth_token');

  return useCallback((extraHeaders: Record<string, string> = {}) => {
    const token = getToken();
    return {
      ...extraHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);
}

// Example: shared API client fetch wrapper
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {},
  extraHeaders: Record<string, string> = {}
): Promise<T> {
  const getHeaders = useAuthHeaders();
  const headers = await getHeaders({ 'Content-Type': 'application/json', ...extraHeaders });
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    // Optionally, throw a normalized error here
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}
