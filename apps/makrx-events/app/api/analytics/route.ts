import { db } from '@/lib/db';
import { isMockMode, safeDbCall } from '@/lib/runtime-guards';
import { events, users } from '@shared/schema';
import { count } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  // If in mock mode or during static export, return static mock analytics
  if (isMockMode() || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return NextResponse.json({
      events: {
        total: 10,
        published: 10,
        draft: 0,
      },
      users: {
        total: 100,
        active: 100,
      },
      registrations: {
        total: 0,
        pending: 0,
        confirmed: 0,
      },
    });
  }
  try {
    // Get basic analytics
    const [eventStats] = await safeDbCall(
      () => db.select({ totalEvents: count() }).from(events),
      [{ totalEvents: 0 }],
    );
    const [userStats] = await safeDbCall(
      () => db.select({ totalUsers: count() }).from(users),
      [{ totalUsers: 0 }],
    );
    return NextResponse.json({
      events: {
        total: eventStats.totalEvents,
        published: eventStats.totalEvents, // Simplified - all are published
        draft: 0,
      },
      users: {
        total: userStats.totalUsers,
        active: userStats.totalUsers,
      },
      registrations: {
        total: 0, // Would need registration tracking
        pending: 0,
        confirmed: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
