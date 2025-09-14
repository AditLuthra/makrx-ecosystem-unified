'use client';

import { useEffect, useCallback } from 'react';
import { measureWebVitals, trackPageLoad, trackResourceLoading } from '../lib/performance';

export function usePerformanceMonitoring() {
  useEffect(() => {
    // Track page load metrics
    const loadMetrics = trackPageLoad();

    // Track slow resources
    const slowResources = trackResourceLoading();

    // Monitor web vitals if available
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Import web-vitals dynamically
      import('web-vitals')
        .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
          onCLS(measureWebVitals);
          onINP(measureWebVitals);
          onFCP(measureWebVitals);
          onLCP(measureWebVitals);
          onTTFB(measureWebVitals);
        })
        .catch(() => {
          // web-vitals not available, skip monitoring
        });
    }
  }, []);
}

export function useMemoryMonitoring() {
  const checkMemoryUsage = useCallback(() => {
    if (typeof window === 'undefined') return null;

    // @ts-ignore - performance.memory is not standard but widely supported
    const memory = (performance as any).memory;

    if (!memory) return null;

    const usage = {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    };

    // Warn if memory usage is high
    if (usage.used / usage.limit > 0.8) {
      console.warn('High memory usage detected:', usage);
    }

    return usage;
  }, []);

  useEffect(() => {
    // Check memory usage periodically
    const interval = setInterval(checkMemoryUsage, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [checkMemoryUsage]);

  return checkMemoryUsage;
}

export function useConnectionMonitoring() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return;
    }

    // @ts-ignore - navigator.connection is experimental
    const connection = (navigator as any).connection;

    const logConnectionInfo = () => {
      const info = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Connection info:', info);
      }

      // Adjust quality based on connection
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        document.documentElement.classList.add('slow-connection');
      }
    };

    logConnectionInfo();

    connection.addEventListener('change', logConnectionInfo);

    return () => {
      connection.removeEventListener('change', logConnectionInfo);
    };
  }, []);
}

export function useErrorBoundaryReporting() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);

      // Report to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        // You can send this to your error tracking service
        // reportError(event.reason);
      }
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);

      // Report to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        // You can send this to your error tracking service
        // reportError(event.error);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
}

// Combined hook for all performance monitoring
export function useComprehensivePerformanceMonitoring() {
  usePerformanceMonitoring();
  useMemoryMonitoring();
  useConnectionMonitoring();
  useErrorBoundaryReporting();
}
