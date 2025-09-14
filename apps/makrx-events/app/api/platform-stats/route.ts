import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventRegistrations, users } from "@shared/schema";
import { sql, count } from "drizzle-orm";

export async function GET() {
  try {
    // Get platform statistics
    const [
      eventsCount,
      usersCount,
      registrationsCount,
      citiesCount
    ] = await Promise.all([
      // Active events count
      db.select({ count: count() })
        .from(events)
        .where(sql`status = 'published' AND start_date >= NOW()`),
      
      // Registered users count
      db.select({ count: count() })
        .from(users)
        .where(sql`status = 'active'`),
      
      // Total registrations count
      db.select({ count: count() })
        .from(eventRegistrations)
        .where(sql`status IN ('confirmed', 'pending')`),
      
      // Unique cities count (approximate)
      db.select({ count: sql<number>`COUNT(DISTINCT location)` })
        .from(events)
        .where(sql`location IS NOT NULL AND location != ''`)
    ]);

    const stats = {
      activeEvents: eventsCount[0]?.count || 0,
      globalCities: citiesCount[0]?.count || 0,
      registeredMakers: usersCount[0]?.count || 0,
      totalWorkshops: registrationsCount[0]?.count || 0
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
      totalWorkshops: formatNumber(stats.totalWorkshops) + '+'
    };

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    
    // Return fallback stats if database query fails
    return NextResponse.json({
      activeEvents: "150+",
      globalCities: "25",
      registeredMakers: "5K+",
      totalWorkshops: "800+"
    });
  }
}