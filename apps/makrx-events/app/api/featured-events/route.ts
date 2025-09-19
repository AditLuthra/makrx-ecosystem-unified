import { db } from '@/lib/db';
import { eventRegistrations, events } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get featured events (upcoming events with high registration count)
    const featuredEvents = await db
      .select({
        id: events.id,
        title: events.title,
        shortDescription: events.shortDescription,
        location: events.location,
        startDate: events.startDate,
        endDate: events.endDate,
        price: events.registrationFee,
        featuredImage: events.featuredImage,
        slug: events.slug,
        type: events.type,
        registrationCount: sql<number>`COALESCE(COUNT(${eventRegistrations.id}), 0)`,
      })
      .from(events)
      .leftJoin(eventRegistrations, sql`${events.id} = ${eventRegistrations.eventId}`)
      .where(sql`${events.status} = 'published' AND ${events.startDate} >= NOW()`)
      .groupBy(events.id)
      .orderBy(sql`COUNT(${eventRegistrations.id}) DESC, ${events.startDate} ASC`)
      .limit(6);

    // Transform data for frontend compatibility
    const transformedEvents = featuredEvents.map((event) => ({
      id: event.id,
      title: event.title,
      shortDescription: event.shortDescription || '',
      location: event.location || 'Online',
      startDate: event.startDate,
      endDate: event.endDate,
      price: event.price || '0.00',
      featuredImage:
        event.featuredImage ||
        `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400`,
      slug: event.slug,
      registrations: event.registrationCount,
      type: event.type || 'Workshop',
    }));

    return NextResponse.json(transformedEvents);
  } catch (error) {
    console.error('Error fetching featured events:', error);

    // Return empty array if query fails
    return NextResponse.json([]);
  }
}
