import { db } from '@/lib/db';
import { isMockMode, safeDbCall } from '@/lib/runtime-guards';
import { eventRegistrations, events, users } from '@shared/schema';
import { count, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  if (isMockMode()) {
    return NextResponse.json({
      activeEvents: 10,
      globalCities: 5,
      registeredMakers: 100,
      totalWorkshops: 20,
    });
  }
  try {
    const [eventsCount, usersCount, registrationsCount, citiesCount] = await Promise.all([
      safeDbCall(
        () =>
          db
            .select({ count: count() })
            .from(events)
            .where(sql`status = 'published' AND start_date >= NOW()`),
        [{ count: 0 }],
      ),
      safeDbCall(
        () =>
          db
            .select({ count: count() })
            .from(users)
            .where(sql`status = 'active'`),
        [{ count: 0 }],
      ),
      safeDbCall(
        () =>
          db
            .select({ count: count() })
            .from(eventRegistrations)
            .where(sql`status IN ('confirmed', 'pending')`),
        [{ count: 0 }],
      ),
      safeDbCall(
        () =>
          db
            .select({ count: sql<number>`COUNT(DISTINCT location)` })
            .from(events)
            .where(sql`location IS NOT NULL AND location != ''`),
        [{ count: 0 }],
      ),
    ]);

    const stats = {
      activeEvents: eventsCount[0]?.count || 0,
      globalCities: citiesCount[0]?.count || 0,
      registeredMakers: usersCount[0]?.count || 0,
      totalWorkshops: registrationsCount[0]?.count || 0,
    };

    // Format numbers for display
    const formatNumber = (num: number) => {
      if (num >= 1000000) return Math.floor(num / 100000) / 10 + 'M';
      if (num >= 1000) return Math.floor(num / 100) / 10 + 'K';
      return num.toString();
    };

    const formattedStats = {
      activeEvents: formatNumber(stats.activeEvents) + '+',
      globalCities: formatNumber(stats.globalCities),
      registeredMakers: formatNumber(stats.registeredMakers) + '+',
      totalWorkshops: formatNumber(stats.totalWorkshops) + '+',
    };

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json({ error: 'Failed to fetch platform stats' }, { status: 500 });
  }
}
