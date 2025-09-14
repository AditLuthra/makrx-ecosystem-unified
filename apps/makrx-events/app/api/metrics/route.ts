import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventRegistrations, users, userActivities } from "@shared/schema";
import { sql, count, desc } from "drizzle-orm";

export async function GET() {
  try {
    const [
      totalEvents,
      totalUsers,
      totalRegistrations,
      recentActivities,
      popularEvents
    ] = await Promise.all([
      // Total events
      db.select({ count: count() }).from(events),
      
      // Total users
      db.select({ count: count() }).from(users),
      
      // Total registrations
      db.select({ count: count() }).from(eventRegistrations),
      
      // Recent activities (last 24 hours)
      db.select({
        activity: userActivities.activity,
        count: count()
      })
        .from(userActivities)
        .where(sql`timestamp >= NOW() - INTERVAL '24 hours'`)
        .groupBy(userActivities.activity)
        .limit(10),
      
      // Most popular events by registration count
      db.select({
        eventId: events.id,
        title: events.title,
        registrationCount: count(eventRegistrations.id)
      })
        .from(events)
        .leftJoin(eventRegistrations, sql`${events.id} = ${eventRegistrations.eventId}`)
        .where(sql`${events.status} = 'published'`)
        .groupBy(events.id, events.title)
        .orderBy(desc(count(eventRegistrations.id)))
        .limit(5)
    ]);

    const metrics = {
      overview: {
        totalEvents: totalEvents[0]?.count || 0,
        totalUsers: totalUsers[0]?.count || 0,
        totalRegistrations: totalRegistrations[0]?.count || 0,
        timestamp: new Date().toISOString()
      },
      recentActivity: recentActivities.map(activity => ({
        type: activity.activity,
        count: activity.count
      })),
      popularEvents: popularEvents.map(event => ({
        id: event.eventId,
        title: event.title,
        registrations: event.registrationCount
      }))
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}