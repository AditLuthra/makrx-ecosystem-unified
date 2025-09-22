import { db } from '@/lib/db';
import { isMockMode, safeDbCall } from '@/lib/runtime-guards';
import { events, users } from '@shared/schema';
import { count } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  if (isMockMode()) {
    return NextResponse.json({
      platform: {
        totalEvents: 10,
        totalUsers: 100,
      },
      user: {
        eventsAttended: 2,
        eventsCreated: 1,
        totalSpent: 85,
        upcomingEvents: 2,
      },
    });
  }
  try {
    // Get event counts
    const [eventStats] = await safeDbCall(
      () => db.select({ totalEvents: count() }).from(events),
      [{ totalEvents: 0 }],
    );
    // Get user count
    const [userStats] = await safeDbCall(
      () => db.select({ totalUsers: count() }).from(users),
      [{ totalUsers: 0 }],
    );
    // Mock some user-specific stats since we don't have auth
    const mockUserStats = {
      eventsAttended: 2,
      eventsCreated: 1,
      totalSpent: 85,
      upcomingEvents: 2,
    };
    return NextResponse.json({
      platform: {
        totalEvents: eventStats.totalEvents,
        totalUsers: userStats.totalUsers,
      },
      user: mockUserStats,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
