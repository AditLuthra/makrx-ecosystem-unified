import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, users, registrations } from '@shared/schema';
import { eq, count, sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get event counts
    const [eventStats] = await db
      .select({
        totalEvents: count(),
      })
      .from(events);

    // Get user count
    const [userStats] = await db
      .select({
        totalUsers: count(),
      })
      .from(users);

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
