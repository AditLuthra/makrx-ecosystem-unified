import { NextRequest, NextResponse } from 'next/server';

// GET /api/microsites/[slug]/analytics - Get analytics for a microsite
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const dateFrom =
      searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dateTo = searchParams.get('to') || new Date().toISOString();
    const granularity = searchParams.get('granularity') || 'daily'; // daily, weekly, monthly

    // Mock analytics data - replace with actual database queries
    const mockAnalytics = {
      overview: {
        totalViews: 15420,
        uniqueVisitors: 8945,
        totalRegistrations: 287,
        totalRevenue: 28750.0,
        conversionRate: 3.21,
        averageTicketPrice: 100.17,
        popularEvents: [
          { slug: '3d-printing-mastery', title: '3D Printing Mastery', registrations: 89 },
          { slug: 'autonomous-robot-competition', title: 'Robot Competition', registrations: 67 },
          { slug: 'iot-sensors-workshop', title: 'IoT Workshop', registrations: 45 },
        ],
      },

      traffic: {
        timeRange: { from: dateFrom, to: dateTo },
        series: [
          { date: '2024-02-01', views: 450, visitors: 289, registrations: 12 },
          { date: '2024-02-02', views: 520, visitors: 315, registrations: 18 },
          { date: '2024-02-03', views: 610, visitors: 378, registrations: 25 },
          { date: '2024-02-04', views: 480, visitors: 290, registrations: 15 },
          { date: '2024-02-05', views: 690, visitors: 425, registrations: 32 },
          { date: '2024-02-06', views: 780, visitors: 467, registrations: 41 },
          { date: '2024-02-07', views: 650, visitors: 390, registrations: 28 },
        ],
      },

      revenue: {
        timeRange: { from: dateFrom, to: dateTo },
        total: 28750.0,
        currency: 'USD',
        series: [
          { date: '2024-02-01', revenue: 1200.0, transactions: 12 },
          { date: '2024-02-02', revenue: 1800.0, transactions: 18 },
          { date: '2024-02-03', revenue: 2500.0, transactions: 25 },
          { date: '2024-02-04', revenue: 1500.0, transactions: 15 },
          { date: '2024-02-05', revenue: 3200.0, transactions: 32 },
          { date: '2024-02-06', revenue: 4100.0, transactions: 41 },
          { date: '2024-02-07', revenue: 2800.0, transactions: 28 },
        ],
        byEvent: [
          { eventSlug: '3d-printing-mastery', eventTitle: '3D Printing Mastery', revenue: 8900.0 },
          {
            eventSlug: 'autonomous-robot-competition',
            eventTitle: 'Robot Competition',
            revenue: 0.0,
          },
          { eventSlug: 'iot-sensors-workshop', eventTitle: 'IoT Workshop', revenue: 4500.0 },
        ],
      },

      registrations: {
        total: 287,
        confirmed: 245,
        pending: 18,
        cancelled: 24,
        byType: {
          free: 156,
          paid: 131,
        },
        byEvent: [
          {
            eventSlug: 'autonomous-robot-competition',
            eventTitle: 'Robot Competition',
            total: 67,
            confirmed: 67,
            pending: 0,
            cancelled: 3,
            capacity: 50,
            waitlisted: 17,
          },
          {
            eventSlug: '3d-printing-mastery',
            eventTitle: '3D Printing Mastery',
            total: 89,
            confirmed: 85,
            pending: 4,
            cancelled: 8,
            capacity: 25,
            waitlisted: 0,
          },
        ],
      },

      demographics: {
        geography: [
          { country: 'United States', visitors: 5234, percentage: 58.5 },
          { country: 'Canada', visitors: 1245, percentage: 13.9 },
          { country: 'United Kingdom', visitors: 890, percentage: 9.9 },
          { country: 'Germany', visitors: 456, percentage: 5.1 },
          { country: 'Australia', visitors: 345, percentage: 3.9 },
        ],
        devices: {
          desktop: 62.3,
          mobile: 31.2,
          tablet: 6.5,
        },
        referrers: [
          { source: 'Direct', visitors: 3567, percentage: 39.9 },
          { source: 'Google', visitors: 2134, percentage: 23.9 },
          { source: 'Social Media', visitors: 1456, percentage: 16.3 },
          { source: 'Email', visitors: 789, percentage: 8.8 },
          { source: 'Other', visitors: 999, percentage: 11.1 },
        ],
      },

      engagement: {
        averageSessionDuration: 285, // seconds
        bounceRate: 34.2, // percentage
        pageViews: {
          '/': 5234,
          '/events': 3456,
          '/events/autonomous-robot-competition': 2134,
          '/events/3d-printing-mastery': 1890,
          '/schedule': 1567,
          '/sponsors': 890,
          '/about': 678,
        },
        conversionFunnel: [
          { step: 'Landing Page', users: 8945, conversionRate: 100 },
          { step: 'Event Details', users: 3456, conversionRate: 38.6 },
          { step: 'Registration Started', users: 456, conversionRate: 13.2 },
          { step: 'Registration Completed', users: 287, conversionRate: 62.9 },
        ],
      },
    };

    return NextResponse.json(mockAnalytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
