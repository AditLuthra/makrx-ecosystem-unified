import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Download,
  ArrowLeft,
  Eye,
  UserCheck,
  CreditCard,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface AnalyticsPageProps {
  params: {
    micrositeSlug: string;
  };
}

// Mock analytics data - replace with real API calls
async function getAnalyticsData(slug: string) {
  const mockData = {
    makerfest2024: {
      id: '1',
      slug: 'makerfest2024',
      title: 'MakerFest 2024',
      overview: {
        totalRegistrations: 1247,
        totalRevenue: 45670,
        conversionRate: 12.5,
        checkInRate: 78,
        avgRegistrationValue: 36.63,
        waitlistCount: 89,
      },
      timeSeriesData: {
        registrations: [
          { date: '2024-01-15', count: 45 },
          { date: '2024-01-22', count: 78 },
          { date: '2024-01-29', count: 134 },
          { date: '2024-02-05', count: 189 },
          { date: '2024-02-12', count: 267 },
          { date: '2024-02-19', count: 398 },
          { date: '2024-02-26', count: 567 },
        ],
        revenue: [
          { date: '2024-01-15', amount: 1890 },
          { date: '2024-01-22', amount: 3420 },
          { date: '2024-01-29', amount: 5670 },
          { date: '2024-02-05', amount: 8950 },
          { date: '2024-02-12', amount: 13240 },
          { date: '2024-02-19', amount: 19870 },
          { date: '2024-02-26', amount: 28450 },
        ],
      },
      eventBreakdown: [
        {
          name: 'Arduino Workshop',
          registrations: 234,
          revenue: 9360,
          capacity: 250,
          conversionRate: 15.2,
        },
        {
          name: '3D Printing Basics',
          registrations: 189,
          revenue: 0,
          capacity: 200,
          conversionRate: 12.8,
        },
        {
          name: 'Robotics Competition',
          registrations: 156,
          revenue: 23400,
          capacity: 180,
          conversionRate: 18.4,
        },
        {
          name: 'IoT Hackathon',
          registrations: 298,
          revenue: 7450,
          capacity: 300,
          conversionRate: 22.1,
        },
        {
          name: 'Sustainable Design',
          registrations: 167,
          revenue: 5010,
          capacity: 200,
          conversionRate: 9.7,
        },
      ],
      demographics: {
        ageGroups: [
          { group: '18-24', count: 298, percentage: 23.9 },
          { group: '25-34', count: 423, percentage: 33.9 },
          { group: '35-44', count: 312, percentage: 25.0 },
          { group: '45-54', count: 156, percentage: 12.5 },
          { group: '55+', count: 58, percentage: 4.7 },
        ],
        locations: [
          { city: 'San Francisco', count: 345, percentage: 27.7 },
          { city: 'San Jose', count: 234, percentage: 18.8 },
          { city: 'Oakland', count: 178, percentage: 14.3 },
          { city: 'Berkeley', count: 134, percentage: 10.7 },
          { city: 'Other Bay Area', count: 198, percentage: 15.9 },
          { city: 'Outside Bay Area', count: 158, percentage: 12.7 },
        ],
      },
      performance: {
        trafficSources: [
          { source: 'Direct', visits: 2340, conversions: 423, rate: 18.1 },
          { source: 'Social Media', visits: 1890, conversions: 287, rate: 15.2 },
          { source: 'Search', visits: 1456, conversions: 234, rate: 16.1 },
          { source: 'Email', visits: 987, conversions: 156, rate: 15.8 },
          { source: 'Referral', visits: 567, conversions: 89, rate: 15.7 },
        ],
        topPages: [
          { page: '/', views: 4567, uniqueViews: 3421 },
          { page: '/events', views: 3421, uniqueViews: 2890 },
          { page: '/events/arduino-workshop', views: 2890, uniqueViews: 2456 },
          { page: '/events/robotics-competition', views: 2567, uniqueViews: 2134 },
          { page: '/schedule', views: 1890, uniqueViews: 1567 },
        ],
      },
    },
  };

  return mockData[slug as keyof typeof mockData] || null;
}

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  prefix = '',
  suffix = '',
}: {
  title: string;
  value: number | string;
  change?: number;
  icon: any;
  prefix?: string;
  suffix?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix}
      </div>
      {change !== undefined && (
        <div
          className={`flex items-center text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {change >= 0 ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {Math.abs(change)}% from last period
        </div>
      )}
    </CardContent>
  </Card>
);

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { micrositeSlug } = await params;
  const analytics = await getAnalyticsData(micrositeSlug);

  if (!analytics) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-4">
                <Link href={`/m/${micrositeSlug}/admin`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{analytics.title} - Analytics</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild>
                <Link href={`/m/${micrositeSlug}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Live
                </Link>
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Registrations"
            value={analytics.overview.totalRegistrations}
            change={12}
            icon={Users}
          />
          <MetricCard
            title="Total Revenue"
            value={analytics.overview.totalRevenue}
            change={8}
            icon={DollarSign}
            prefix="$"
          />
          <MetricCard
            title="Conversion Rate"
            value={analytics.overview.conversionRate}
            change={-2.1}
            icon={Target}
            suffix="%"
          />
          <MetricCard
            title="Check-in Rate"
            value={analytics.overview.checkInRate}
            change={5.3}
            icon={UserCheck}
            suffix="%"
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Important metrics and trends for your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Registration Value</span>
                      <span className="text-lg font-bold">
                        ${analytics.overview.avgRegistrationValue}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Waitlist Count</span>
                      <span className="text-lg font-bold text-orange-600">
                        {analytics.overview.waitlistCount}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">Top Performing Event</div>
                      <div className="text-lg font-bold text-green-900">IoT Hackathon</div>
                      <div className="text-sm text-green-700">22.1% conversion rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Trend</CardTitle>
                <CardDescription>Weekly registration growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.timeSeriesData.registrations.map((week, index) => (
                    <div key={week.date} className="flex items-center space-x-4">
                      <div className="w-20 text-sm text-gray-500">Week {index + 1}</div>
                      <div className="flex-1">
                        <Progress value={(week.count / 600) * 100} className="h-3" />
                      </div>
                      <div className="w-16 text-sm font-medium text-right">{week.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Performance</CardTitle>
                <CardDescription>Registration and revenue breakdown by event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.eventBreakdown.map((event) => (
                    <div key={event.name} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{event.name}</h4>
                          <div className="text-sm text-gray-500">
                            {event.registrations}/{event.capacity} registered
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${event.revenue.toLocaleString()}</div>
                          <Badge variant="outline">{event.conversionRate}% conversion</Badge>
                        </div>
                      </div>
                      <Progress
                        value={(event.registrations / event.capacity) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                  <CardDescription>Participant age groups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.demographics.ageGroups.map((group) => (
                      <div key={group.group} className="flex items-center space-x-3">
                        <div className="w-16 text-sm">{group.group}</div>
                        <div className="flex-1">
                          <Progress value={group.percentage} className="h-2" />
                        </div>
                        <div className="w-12 text-sm text-right">{group.percentage}%</div>
                        <div className="w-12 text-xs text-gray-500 text-right">({group.count})</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Participant locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.demographics.locations.map((location) => (
                      <div key={location.city} className="flex items-center space-x-3">
                        <div className="w-24 text-sm">{location.city}</div>
                        <div className="flex-1">
                          <Progress value={location.percentage} className="h-2" />
                        </div>
                        <div className="w-12 text-sm text-right">{location.percentage}%</div>
                        <div className="w-12 text-xs text-gray-500 text-right">
                          ({location.count})
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.performance.trafficSources.map((source) => (
                      <div key={source.source} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{source.source}</span>
                          <Badge variant="outline">{source.rate}% conversion</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {source.visits.toLocaleString()} visits • {source.conversions} conversions
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>Most visited pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.performance.topPages.map((page) => (
                      <div key={page.page} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{page.page}</div>
                          <div className="text-xs text-gray-500">
                            {page.uniqueViews.toLocaleString()} unique views
                          </div>
                        </div>
                        <div className="text-sm font-bold">{page.views.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
