import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  eventRegistrations,
  eventCheckIns,
  userActivities,
  eventSessions,
  sessionRegistrations,
  livestreams,
} from '@shared/schema';
import { eq, gte, count, sql } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const eventId = params.eventId;

    // Get basic metrics
    const [registrationsResult] = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));

    const [revenueResult] = await db
      .select({
        total: sql`COALESCE(SUM(CAST(${eventRegistrations.amountPaid} AS DECIMAL)), 0)`,
      })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));

    const [checkInsResult] = await db
      .select({ count: count() })
      .from(eventCheckIns)
      .where(eq(eventCheckIns.eventId, eventId));

    // Get current live viewers (mock data for now)
    const [liveViewersResult] = await db
      .select({
        viewers: sql`COALESCE(SUM(${livestreams.viewerCount}), 0)`,
      })
      .from(livestreams)
      .where(eq(livestreams.eventId, eventId));

    // Calculate check-in rate
    const totalRegistrations = registrationsResult.count;
    const totalCheckIns = checkInsResult.count;
    const checkInRate =
      totalRegistrations > 0 ? Math.round((totalCheckIns / totalRegistrations) * 100) : 0;

    // Get registration trend (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const registrationTrend = await db
      .select({
        time: sql`DATE_TRUNC('hour', ${eventRegistrations.registeredAt})`,
        count: count(),
      })
      .from(eventRegistrations)
      .where(gte(eventRegistrations.registeredAt, oneDayAgo))
      .groupBy(sql`DATE_TRUNC('hour', ${eventRegistrations.registeredAt})`)
      .orderBy(sql`DATE_TRUNC('hour', ${eventRegistrations.registeredAt})`);

    // Get revenue trend (last 24 hours)
    const revenueTrend = await db
      .select({
        time: sql`DATE_TRUNC('hour', ${eventRegistrations.registeredAt})`,
        amount: sql`SUM(CAST(${eventRegistrations.amountPaid} AS DECIMAL))`,
      })
      .from(eventRegistrations)
      .where(gte(eventRegistrations.registeredAt, oneDayAgo))
      .groupBy(sql`DATE_TRUNC('hour', ${eventRegistrations.registeredAt})`)
      .orderBy(sql`DATE_TRUNC('hour', ${eventRegistrations.registeredAt})`);

    // Get session attendance
    const sessionAttendance = await db
      .select({
        id: eventSessions.id,
        name: eventSessions.title,
        registered: count(sessionRegistrations.id),
      })
      .from(eventSessions)
      .leftJoin(sessionRegistrations, eq(eventSessions.id, sessionRegistrations.sessionId))
      .where(eq(eventSessions.eventId, eventId))
      .groupBy(eventSessions.id, eventSessions.title);

    // Add check-in counts to session attendance
    const sessionAttendanceWithCheckIns = await Promise.all(
      sessionAttendance.map(async (session) => {
        const [checkInCount] = await db
          .select({ count: count() })
          .from(eventCheckIns)
          .where(eq(eventCheckIns.eventId, eventId));

        return {
          name: session.name,
          registered: session.registered,
          checkedIn: Math.floor(checkInCount.count / sessionAttendance.length), // Distribute evenly for demo
        };
      }),
    );

    // Mock demographic data
    const demographicData = [
      { name: 'Students', value: Math.floor(totalRegistrations * 0.4), color: '#3b82f6' },
      { name: 'Professionals', value: Math.floor(totalRegistrations * 0.35), color: '#10b981' },
      { name: 'Hobbyists', value: Math.floor(totalRegistrations * 0.25), color: '#f59e0b' },
    ];

    // Get recent activities
    const recentActivities = await db
      .select({
        id: userActivities.id,
        activity: userActivities.activity,
        userId: userActivities.userId,
        timestamp: userActivities.timestamp,
        metadata: userActivities.metadata,
      })
      .from(userActivities)
      .where(eq(userActivities.eventId, eventId))
      .orderBy(sql`${userActivities.timestamp} DESC`)
      .limit(10);

    // Format activities for display
    const formattedActivities = recentActivities.map((activity) => ({
      id: activity.id,
      type: activity.activity,
      user: `User ${activity.userId.slice(0, 8)}`,
      timestamp: activity.timestamp.toISOString(),
      details: getActivityDetails(activity.activity),
    }));

    const metrics = {
      totalRegistrations,
      totalRevenue: Number(revenueResult.total) || 0,
      checkInRate,
      liveViewers: Number(liveViewersResult.viewers) || 0,
      registrationTrend: registrationTrend.map((item) => ({
        time: item.time,
        count: item.count,
      })),
      revenueTrend: revenueTrend.map((item) => ({
        time: item.time,
        amount: Number(item.amount) || 0,
      })),
      sessionAttendance: sessionAttendanceWithCheckIns,
      demographicData,
      recentActivities: formattedActivities,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}

function getActivityDetails(activity: string): string {
  switch (activity) {
    case 'register':
      return 'registered for the event';
    case 'check_in':
      return 'checked in to the event';
    case 'cancel':
      return 'cancelled their registration';
    case 'view':
      return 'viewed the event page';
    case 'create_event':
      return 'created a new event';
    default:
      return 'performed an action';
  }
}
