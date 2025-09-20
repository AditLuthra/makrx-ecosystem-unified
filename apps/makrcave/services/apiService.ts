// Centralized API client (browser-safe) that hits your backend.
// Configure base URL via NEXT_PUBLIC_API_BASE_URL (preferred) or NEXT_PUBLIC_API_URL (alias),
// otherwise it will use relative paths.

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ApiRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: HeadersInit;
};

const normalizeHeaders = (input?: HeadersInit): Record<string, string> => {
  if (!input) return {};

  const entries: Array<[string, string]> = [];

  if (typeof Headers !== 'undefined' && input instanceof Headers) {
    input.forEach((value, key) => {
      entries.push([key, value]);
    });
  } else if (Array.isArray(input)) {
    input.forEach(([key, value]) => {
      entries.push([key, String(value)]);
    });
  } else {
    Object.entries(input).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        entries.push([key, value.join(', ')]);
      } else {
        entries.push([key, String(value)]);
      }
    });
  }

  return entries.reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
};

function isFormLike(body: unknown): body is FormData | URLSearchParams {
  if (typeof FormData !== 'undefined' && body instanceof FormData) return true;
  return typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;
}

function isBinaryBody(body: unknown): body is Blob | ArrayBuffer | ArrayBufferView {
  if (typeof Blob !== 'undefined' && body instanceof Blob) return true;
  if (body instanceof ArrayBuffer) return true;
  return ArrayBuffer.isView(body);
}

async function request<T = any>(
  method: HttpMethod,
  url: string,
  body?: unknown,
  opts: ApiRequestOptions = {},
) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const { headers: incomingHeaders, body: rawBody, ...restOpts } = opts;
  const headers = new Headers(normalizeHeaders(incomingHeaders));

  let preparedBody: BodyInit | null | undefined = rawBody as BodyInit | null | undefined;

  if (body !== undefined) {
    if (body === null) {
      preparedBody = null;
    } else if (typeof body === 'string') {
      preparedBody = body;
    } else if (isFormLike(body) || isBinaryBody(body)) {
      preparedBody = body as BodyInit;
    } else {
      preparedBody = JSON.stringify(body);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }
  }

  const res = await fetch(fullUrl, {
    ...restOpts,
    method,
    headers,
    body: preparedBody,
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
  get: <T = any>(url: string, opts?: ApiRequestOptions) => request<T>('GET', url, undefined, opts),
  post: <T = any>(url: string, body?: any, opts?: ApiRequestOptions) =>
    request<T>('POST', url, body, opts),
  put: <T = any>(url: string, body?: any, opts?: ApiRequestOptions) =>
    request<T>('PUT', url, body, opts),
  delete: <T = any>(url: string, opts?: ApiRequestOptions) =>
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
