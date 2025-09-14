// Centralized API client (browser-safe) that hits your backend.
// Configure base URL via NEXT_PUBLIC_API_BASE_URL or use relative paths.

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function request<T = any>(
  method: string,
  url: string,
  body?: any,
  opts?: RequestInit & { headers?: Record<string, string> },
) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts?.headers || {}),
  };
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json() as Promise<T>;
  return (await res.text()) as unknown as T;
}

const api = {
  get: <T = any>(url: string, opts?: RequestInit & { headers?: Record<string, string> }) =>
    request<T>('GET', url, undefined, opts),
  post: <T = any>(
    url: string,
    body?: any,
    opts?: RequestInit & { headers?: Record<string, string> },
  ) => request<T>('POST', url, body, opts),
  put: <T = any>(
    url: string,
    body?: any,
    opts?: RequestInit & { headers?: Record<string, string> },
  ) => request<T>('PUT', url, body, opts),
  delete: <T = any>(url: string, opts?: RequestInit & { headers?: Record<string, string> }) =>
    request<T>('DELETE', url, undefined, opts),
  analytics: {
    getEquipmentStats: () => request('GET', '/api/v1/analytics/equipment'),
  },
  reservations: {
    getAllReservations: () => request('GET', '/api/v1/equipment-reservations'),
    createReservation: (data: any) => request('POST', '/api/v1/equipment-reservations', data),
  },
};

export const equipmentApi = {
  async getEquipment() {
    return { data: [], error: null } as any;
  },
};

export default api;
export { api };
