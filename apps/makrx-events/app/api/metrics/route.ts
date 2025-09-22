import { db } from '@/lib/db';
import { isMockMode, safeDbCall } from '@/lib/runtime-guards';
import { eventRegistrations, events, userActivities, users } from '@shared/schema';
import { count, desc, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  // Provide mock data if in mock mode or DB is unavailable
  if (isMockMode()) {
    return NextResponse.json({
      totalEvents: 10,
      totalUsers: 100,
      totalRegistrations: 250,
      recentActivities: [
        { activity: 'register', count: 20 },
        { activity: 'login', count: 50 },
      ],
      popularEvents: [
        { eventId: '1', title: 'Mock Event 1', registrationCount: 50 },
        { eventId: '2', title: 'Mock Event 2', registrationCount: 30 },
      ],
    });
  }
  try {
    const [totalEvents, totalUsers, totalRegistrations, recentActivities, popularEvents] =
      await Promise.all([
        safeDbCall(() => db.select({ count: count() }).from(events), [{ count: 0 }]),
        safeDbCall(() => db.select({ count: count() }).from(users), [{ count: 0 }]),
        safeDbCall(() => db.select({ count: count() }).from(eventRegistrations), [{ count: 0 }]),
        safeDbCall(
          () =>
            db
              .select({
                activity: userActivities.activity,
                count: count(),
              })
              .from(userActivities)
              .where(sql`timestamp >= NOW() - INTERVAL '24 hours'`)
              .groupBy(userActivities.activity)
              .limit(10),
          [],
        ),
        safeDbCall(
          () =>
            db
              .select({
                eventId: events.id,
                title: events.title,
                registrationCount: count(eventRegistrations.id),
              })
              .from(events)
              .leftJoin(eventRegistrations, sql`${events.id} = ${eventRegistrations.eventId}`)
              .where(sql`${events.status} = 'published'`)
              .groupBy(events.id, events.title)
              .orderBy(desc(count(eventRegistrations.id)))
              .limit(5),
          [],
        ),
      ]);

    return NextResponse.json({
      totalEvents: totalEvents[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      totalRegistrations: totalRegistrations[0]?.count || 0,
      recentActivities,
      popularEvents,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
