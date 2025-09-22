import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow static/mock data for static export safety
  return NextResponse.json({
    totalUsers: 1000,
    totalEvents: 50,
    totalRegistrations: 2000,
    totalRevenue: 0,
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
  });
}
