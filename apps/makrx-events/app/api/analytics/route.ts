import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, users, registrations } from '@shared/schema';
import { count, sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get basic analytics
    const [eventStats] = await db
      .select({
        totalEvents: count(),
      })
      .from(events);

    const [userStats] = await db
      .select({
        totalUsers: count(),
      })
      .from(users);

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
