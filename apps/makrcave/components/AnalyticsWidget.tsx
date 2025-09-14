'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
}

interface AnalyticsWidgetProps {
  title?: string;
  period?: '24h' | '7d' | '30d' | '90d';
  onPeriodChange?: (period: string) => void;
  data?: MetricData[];
  loading?: boolean;
}

const AnalyticsWidget = React.memo(function AnalyticsWidget({
  title = 'Analytics',
  period = '7d',
  onPeriodChange,
  data = [],
  loading = false,
}: AnalyticsWidgetProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const defaultData: MetricData[] = useMemo(
    () => [
      { label: 'Active Users', value: 142, change: 12.5, trend: 'up', unit: 'users' },
      { label: 'Equipment Usage', value: 87, change: -3.2, trend: 'down', unit: '%' },
      { label: 'Projects Created', value: 23, change: 18.7, trend: 'up', unit: 'projects' },
      { label: 'Revenue', value: 4250, change: 8.3, trend: 'up', unit: '₹' },
    ],
    [],
  );

  const metrics = useMemo(() => (data.length > 0 ? data : defaultData), [data, defaultData]);

  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  const getTrendColor = useCallback((trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange?.(p)}
              className="h-7 px-2 text-xs"
            >
              {p}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                selectedMetric === metric.label ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() =>
                setSelectedMetric(selectedMetric === metric.label ? null : metric.label)
              }
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                  {index === 0 && <Users className="w-4 h-4 text-blue-600" />}
                  {index === 1 && <BarChart3 className="w-4 h-4 text-blue-600" />}
                  {index === 2 && <PieChart className="w-4 h-4 text-blue-600" />}
                  {index === 3 && <TrendingUp className="w-4 h-4 text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold">
                      {metric.unit === '₹'
                        ? `₹${metric.value.toLocaleString()}`
                        : metric.unit === '%'
                          ? `${metric.value}%`
                          : `${metric.value}${metric.unit ? ' ' + metric.unit : ''}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    metric.trend === 'up'
                      ? 'default'
                      : metric.trend === 'down'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className="flex items-center space-x-1"
                >
                  {getTrendIcon(metric.trend)}
                  <span className="text-xs">
                    {metric.change > 0 ? '+' : ''}
                    {metric.change.toFixed(1)}%
                  </span>
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {selectedMetric && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Selected: <strong>{selectedMetric}</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Click on metrics to view detailed analytics
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default AnalyticsWidget;
