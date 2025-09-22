'use client';

import { Providers } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Activity, Calendar, DollarSign, Download, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type MonthPoint = { month: string; revenue: number };
type GrowthPoint = { month: string; users: number; events: number };
type EventTypePoint = { name: string; value: number; color?: string };
type LocationPoint = { location: string; eventCount: number; registrations: number };
type RegistrationPoint = { date: string; registrations: number };

interface AnalyticsData {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  userGrowth: GrowthPoint[];
  eventTypes: EventTypePoint[];
  topLocations: LocationPoint[];
  revenueByMonth: MonthPoint[];
  registrationTrends: RegistrationPoint[];
}

async function fetchAnalytics({ queryKey }: { queryKey: [string, { timeRange: string }] }) {
  const [, { timeRange }] = queryKey;
  const res = await fetch(`/api/admin/analytics?timeRange=${encodeURIComponent(timeRange)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to fetch analytics (${res.status})`);
  }
  return (await res.json()) as AnalyticsData;
}

function toCurrency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function downloadBlob(data: BlobPart, filename: string, type = 'text/plain') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildOverviewCsv(a: AnalyticsData) {
  const rows = [
    ['Metric', 'Value'],
    ['Total Users', a.totalUsers],
    ['Total Events', a.totalEvents],
    ['Total Registrations', a.totalRegistrations],
    ['Total Revenue', a.totalRevenue],
  ];
  return rows.map((r) => r.join(',')).join('\n');
}

export default function AnalyticsPage() {
  return (
    <Providers>
      <AnalyticsPageContent />
    </Providers>
  );
}

function AnalyticsPageContent() {
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('6m');

  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['/api/admin/analytics', { timeRange }],
    queryFn: fetchAnalytics,
    // tune as needed:
    staleTime: 60_000,
    retry: 2,
  });

  const hasCharts =
    !!analytics &&
    (analytics.userGrowth?.length ||
      analytics.eventTypes?.length ||
      analytics.topLocations?.length ||
      analytics.revenueByMonth?.length ||
      analytics.registrationTrends?.length);

  const exportCSV = () => {
    if (!analytics) return;
    const csv = buildOverviewCsv(analytics);
    downloadBlob(
      csv,
      `platform-analytics-overview-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv',
    );
  };

  const exportJSON = () => {
    if (!analytics) return;
    const json = JSON.stringify(analytics, null, 2);
    downloadBlob(
      json,
      `platform-analytics-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json',
    );
  };

  const lastMonthUserDelta = useMemo(() => {
    if (!analytics?.userGrowth || analytics.userGrowth.length < 2) return null;
    const arr = analytics.userGrowth;
    const prev = arr[arr.length - 2]?.users ?? 0;
    const curr = arr[arr.length - 1]?.users ?? 0;
    if (prev <= 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }, [analytics?.userGrowth]);

  const lastMonthEventDelta = useMemo(() => {
    if (!analytics?.userGrowth || analytics.userGrowth.length < 2) return null;
    const arr = analytics.userGrowth;
    const prev = arr[arr.length - 2]?.events ?? 0;
    const curr = arr[arr.length - 1]?.events ?? 0;
    if (prev <= 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }, [analytics?.userGrowth]);

  const lastMonthRegDelta = useMemo(() => {
    if (!analytics?.registrationTrends || analytics.registrationTrends.length < 2) return null;
    const arr = analytics.registrationTrends;
    const prev = arr[arr.length - 2]?.registrations ?? 0;
    const curr = arr[arr.length - 1]?.registrations ?? 0;
    if (prev <= 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }, [analytics?.registrationTrends]);

  const lastMonthRevenueDelta = useMemo(() => {
    if (!analytics?.revenueByMonth || analytics.revenueByMonth.length < 2) return null;
    const arr = analytics.revenueByMonth;
    const prev = arr[arr.length - 2]?.revenue ?? 0;
    const curr = arr[arr.length - 1]?.revenue ?? 0;
    if (prev <= 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }, [analytics?.revenueByMonth]);

  // Loading
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted/50 rounded mb-3 animate-pulse" />
                <div className="h-3 w-24 bg-muted/50 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center py-8">Loading analytics…</div>
      </div>
    );
  }

  // Error
  if (isError || !analytics) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-lg text-muted-foreground mb-4">Failed to load analytics data.</p>
        {error instanceof Error && (
          <p className="text-sm text-muted-foreground mb-6">{error.message}</p>
        )}
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Platform Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform metrics and insights</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV} disabled={isFetching}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={exportJSON} disabled={isFetching}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={analytics.totalUsers.toLocaleString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          delta={lastMonthUserDelta}
        />
        <StatCard
          title="Total Events"
          value={analytics.totalEvents.toLocaleString()}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          delta={lastMonthEventDelta}
        />
        <StatCard
          title="Registrations"
          value={analytics.totalRegistrations.toLocaleString()}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          delta={lastMonthRegDelta}
        />
        <StatCard
          title="Revenue"
          value={toCurrency(analytics.totalRevenue)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          delta={lastMonthRevenueDelta}
        />
      </div>

      {/* Charts */}
      {hasCharts ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>User & Event Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="events"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Events"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.eventTypes?.length ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={analytics.eventTypes}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                        dataKey="value"
                        nameKey="name"
                      >
                        {analytics.eventTypes.map((entry, i) => (
                          <Cell key={i} fill={entry.color || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartHint label="No event-type data in this range." />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.topLocations?.length ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={analytics.topLocations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="eventCount" fill="#8884d8" name="Event Count" />
                      <Bar dataKey="registrations" fill="#82ca9d" name="Registrations" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartHint label="No location data in this range." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Month</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.revenueByMonth?.length ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={analytics.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(v: number) => toCurrency(v)} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartHint label="No revenue data in this range." />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Registration Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.registrationTrends?.length ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={analytics.registrationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="registrations"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Registrations"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartHint label="No registration data in this range." />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          No chart data for this time range.
        </div>
      )}
    </div>
  );
}

/* ---------- tiny helpers / presentational bits ---------- */

function StatCard({
  title,
  value,
  icon,
  delta,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  delta: number | null;
}) {
  const isUp = (delta ?? 0) >= 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta !== null ? (
          <div className="flex items-center mt-2">
            <TrendingUp
              className={`h-3 w-3 mr-1 ${isUp ? 'text-green-600' : 'text-red-600 rotate-180'}`}
            />
            <p className={`text-xs ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {isUp ? '+' : ''}
              {delta}% from last month
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-2">No prior month for comparison</p>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyChartHint({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground text-center py-8">{label}</p>;
}
