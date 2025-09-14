import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, events, micrositeRegistrations } from '@shared/schema';
import { requireAuth } from '@/lib/auth-middleware';
import { AuthenticatedRequest } from '@/lib/auth-middleware';
import { count, eq, sql, gte, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Require authentication and check for admin role
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    const user = (request as AuthenticatedRequest).user;
    
    // Check if user has admin privileges
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('event_admin')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '6m';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate = new Date('2020-01-01'); // Platform start date
        break;
    }

    // Get basic counts
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users);

    const [totalEventsResult] = await db
      .select({ count: count() })
      .from(events);

    const [totalRegistrationsResult] = await db
      .select({ count: count() })
      .from(micrositeRegistrations);

    // Mock data for now - replace with real calculations when payment system is integrated
    const mockData = {
      totalUsers: totalUsersResult?.count || 0,
      totalEvents: totalEventsResult?.count || 0,
      totalRegistrations: totalRegistrationsResult?.count || 0,
      totalRevenue: 0, // Will be calculated from payments when Stripe is integrated
      
      // Mock growth data - replace with real database queries
      userGrowth: [
        { month: 'Jan', users: 120, events: 8 },
        { month: 'Feb', users: 150, events: 12 },
        { month: 'Mar', users: 180, events: 15 },
        { month: 'Apr', users: 220, events: 18 },
        { month: 'May', users: 280, events: 25 },
        { month: 'Jun', users: 320, events: 30 },
      ],

      eventTypes: [
        { type: 'Workshop', count: 15, color: '#8884d8' },
        { type: 'Competition', count: 8, color: '#82ca9d' },
        { type: 'Exhibition', count: 5, color: '#ffc658' },
        { type: 'Conference', count: 3, color: '#ff7300' },
      ],

      topLocations: [
        { location: 'San Francisco, CA', eventCount: 12, registrations: 450 },
        { location: 'New York, NY', eventCount: 8, registrations: 320 },
        { location: 'Austin, TX', eventCount: 6, registrations: 280 },
        { location: 'Seattle, WA', eventCount: 5, registrations: 210 },
        { location: 'Boston, MA', eventCount: 4, registrations: 180 },
      ],

      revenueByMonth: [
        { month: 'Jan', revenue: 2400 },
        { month: 'Feb', revenue: 3200 },
        { month: 'Mar', revenue: 2800 },
        { month: 'Apr', revenue: 4100 },
        { month: 'May', revenue: 3800 },
        { month: 'Jun', revenue: 5200 },
      ],

      registrationTrends: [
        { date: '2024-01', registrations: 45 },
        { date: '2024-02', registrations: 68 },
        { date: '2024-03', registrations: 52 },
        { date: '2024-04', registrations: 89 },
        { date: '2024-05', registrations: 76 },
        { date: '2024-06', registrations: 124 },
      ],
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}