import { getToken } from '@/lib/auth';

// Services backend base URL (e.g., https://services.makrx.store)
const SERVICES_BASE_URL = (process.env.NEXT_PUBLIC_SERVICES_API_URL ?? '').replace(/\/+$/, '');

class ProviderApiClient {
  private sessionId: string;

  constructor() {
    this.sessionId = typeof window !== 'undefined' ? this.getOrCreateSessionId() : '';
  }

  private getOrCreateSessionId(): string {
    const KEY = 'makrx_session_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!SERVICES_BASE_URL) {
      throw new Error(
        'NEXT_PUBLIC_SERVICES_API_URL is not configured. Provider API calls require this value.',
      );
    }

    const url = `${SERVICES_BASE_URL}${endpoint}`;
    const token = await getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Session-ID': this.sessionId || '',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }

  // Provider endpoints
  getDashboard() {
    return this.request<any>('/api/provider/dashboard');
  }

  getAvailableJobs() {
    return this.request<any>('/api/provider/jobs/available');
  }

  acceptJob(orderId: string) {
    return this.request<any>(`/api/provider/jobs/${orderId}/accept`, { method: 'POST' });
  }

  getJobs(status?: string) {
    const path = status
      ? `/api/provider/jobs?status=${encodeURIComponent(status)}`
      : '/api/provider/jobs';
    return this.request<any>(path);
  }

  updateJobStatus(jobId: string, status: string, notes?: string) {
    return this.request<any>(`/api/provider/jobs/${jobId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  updateInventory(materialId: string, quantity: number, action: 'add' | 'subtract') {
    return this.request<any>(`/api/provider/inventory/${encodeURIComponent(materialId)}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, action }),
    });
  }

  getInventory() {
    return this.request<any>('/api/provider/inventory');
  }
}

export const providerApi = new ProviderApiClient();
export default providerApi;
