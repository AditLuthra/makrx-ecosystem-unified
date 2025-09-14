export type SystemService = {
  service: string; // legacy name used by UI
  status: 'healthy'|'degraded'|'unhealthy';
  responseTime?: number;
  timestamp?: number;
  details?: string;
  error?: string;
  metadata?: Record<string, any>;
};

export interface SystemHealthStatus {
  overall: 'healthy'|'degraded'|'unhealthy'|'unknown';
  environment?: string;
  lastUpdated?: number;
  services: SystemService[];
}

export async function checkBackendHealth() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}

export async function checkDependencies() {
  return { redis: 'ok', db: 'ok' };
}

const healthCheckService = {
  async getQuickStatus(): Promise<{ status: 'healthy'|'degraded'|'unhealthy'; message: string }> {
    return { status: 'healthy', message: 'All systems operational' };
  },
  async runAllChecks(): Promise<SystemHealthStatus> {
    const now = Date.now();
    const services: SystemService[] = [
      { service: 'api', status: 'healthy', responseTime: 120, timestamp: now, details: 'OK' },
      { service: 'db', status: 'healthy', responseTime: 80, timestamp: now, details: 'OK' },
    ];
    return { overall: 'healthy', environment: process.env.NODE_ENV || 'development', lastUpdated: now, services };
  },
  clearCache() {/* no-op for stub */},
};

export default healthCheckService;
export { healthCheckService };
