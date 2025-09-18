'use client';

import { createContext, useContext, ReactNode } from 'react';

type HealthState = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

interface HealthStatus {
  overall: HealthState;
  message: string;
  environment?: string;
  lastUpdate?: string;
}

interface HealthMetrics {
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  unhealthyServices: number;
  healthPercentage: number;
  averageResponseTime: number;
}

interface HealthContextValue {
  isLoading: boolean;
  lastUpdate?: string;
  runHealthChecks: () => Promise<void> | void;
}

const HealthContext = createContext<HealthContextValue | null>(null);
const HealthStatusContext = createContext<HealthStatus | null>(null);
const HealthMetricsContext = createContext<HealthMetrics | null>(null);

const defaultStatus: HealthStatus = {
  overall: 'unknown',
  message: 'Health status unavailable',
  environment: undefined,
  lastUpdate: undefined,
};

const defaultMetrics: HealthMetrics = {
  totalServices: 0,
  healthyServices: 0,
  degradedServices: 0,
  unhealthyServices: 0,
  healthPercentage: 0,
  averageResponseTime: 0,
};

export function HealthProvider({ children }: { children: ReactNode }) {
  const value: HealthContextValue = {
    isLoading: false,
    lastUpdate: undefined,
    runHealthChecks: async () => undefined,
  };

  return (
    <HealthContext.Provider value={value}>
      <HealthStatusContext.Provider value={defaultStatus}>
        <HealthMetricsContext.Provider value={defaultMetrics}>
          {children}
        </HealthMetricsContext.Provider>
      </HealthStatusContext.Provider>
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return ctx;
}

export function useHealthStatus() {
  const ctx = useContext(HealthStatusContext);
  if (!ctx) {
    throw new Error('useHealthStatus must be used within a HealthProvider');
  }
  return ctx;
}

export function useHealthMetrics() {
  const ctx = useContext(HealthMetricsContext);
  if (!ctx) {
    throw new Error('useHealthMetrics must be used within a HealthProvider');
  }
  return ctx;
}

