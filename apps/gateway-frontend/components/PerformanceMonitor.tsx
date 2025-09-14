'use client';

import { useComprehensivePerformanceMonitoring } from '../hooks/usePerformance';

export default function PerformanceMonitor() {
    useComprehensivePerformanceMonitoring();

    // This component doesn't render anything, it just sets up monitoring
    return null;
}
