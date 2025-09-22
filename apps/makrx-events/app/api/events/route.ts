import { db } from '@/lib/db';
import { isMockMode } from '@/lib/runtime-guards';
import { events, users } from '@shared/schema';
import { and, eq, ilike, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (isMockMode()) {
    // Return mock events
    return NextResponse.json([
      {
        id: 'mock1',
        title: 'Mock Event 1',
        description: 'A mock event for testing',
        location: 'Online',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        type: 'Workshop',
        status: 'published',
        price: '0.00',
      },
      {
        id: 'mock2',
        title: 'Mock Event 2',
        description: 'Another mock event',
        location: 'Hybrid',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
        type: 'Competition',
        status: 'published',
        price: '10.00',
      },
    ]);
  }
  try {
    const { searchParams } = new URL(request.url);
    // Extract filter parameters
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const types = type
      ? type
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const status = searchParams.get('status') || 'all';
    const location = searchParams.get('location') || '';
    const priceRange = searchParams.get('priceRange') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const hasAvailableSpots = searchParams.get('hasAvailableSpots') === 'true';

    // Build where conditions
    const conditions = [];

    // ...existing code...

    // Location filter
    if (location) {
      conditions.push(ilike(events.location, `%${location}%`));
    }

    // Price range filter
    if (priceRange !== 'all') {
      if (priceRange === 'free') {
        conditions.push(sql`events.registration_fee = 0`);
      } else if (priceRange === '0-25') {
        conditions.push(sql`events.registration_fee >= 0 AND events.registration_fee <= 25`);
      } else if (priceRange === '25-50') {
        conditions.push(sql`events.registration_fee >= 25 AND events.registration_fee <= 50`);
      } else if (priceRange === '50-100') {
        conditions.push(sql`events.registration_fee >= 50 AND events.registration_fee <= 100`);
      } else if (priceRange === '100+') {
        conditions.push(sql`events.registration_fee >= 100`);
      }
    }

    // Date range filter (using correct column names)
    if (startDate) {
      conditions.push(sql`events.start_date >= ${new Date(startDate)}`);
    }
    if (endDate) {
      conditions.push(sql`events.end_date <= ${new Date(endDate)}`);
    }

    // Only published events
    conditions.push(eq(events.status, 'published'));

    // Build the query
    const baseQuery = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        shortDescription: events.description,
        slug: events.id,
        type: events.type,
        location: events.location,
        latitude: sql`NULL as latitude`,
        longitude: sql`NULL as longitude`,
        startDate: sql`events.start_date`,
        endDate: sql`events.end_date`,
        registrationFee: sql`events.registration_fee`,
        maxAttendees: sql`events.max_attendees`,
        featuredImage: events.featuredImage,
        status: events.status,
        createdAt: events.createdAt,
        organizer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        features: {
          competitions: sql`false as competitions`,
          workshops: sql`false as workshops`,
          exhibitions: sql`false as exhibitions`,
        },
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id));
    // Apply filters and execute query
    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    const allEvents = await query.orderBy(sql`events.start_date`);

    // Filter for available spots if requested (this requires a subquery for registration count)
    let filteredEvents = allEvents;
    if (hasAvailableSpots) {
      filteredEvents = allEvents.filter((event) => {
        // If maxAttendees is null/undefined, assume unlimited spots
        return (
          !event.maxAttendees || (typeof event.maxAttendees === 'number' && event.maxAttendees > 0)
        );
      });
    }

    return NextResponse.json(filteredEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }

    // Validate required fields
    if (!body.title || !body.description || !body.location || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, location, startDate, endDate' },
        { status: 400 },
      );
    }

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    // Create event in database using raw SQL to avoid schema mismatch
    const result = await db.execute(sql`
      INSERT INTO events (
        title, description, short_description, slug, location, 
        start_date, end_date, registration_fee, max_attendees, 
        organizer_id, status
      ) VALUES (
        ${body.title},
        ${body.description},
        ${body.shortDescription || body.description.substring(0, 100)},
        ${slug},
        ${body.location},
        ${new Date(body.startDate)},
        ${new Date(body.endDate)},
        ${parseFloat(body.registrationFee) || 0},
        ${body.maxAttendees ? parseInt(body.maxAttendees) : null},
        ${'test-user-1'},
        ${'published'}
      ) RETURNING *
    `);

    const newEvent = result.rows[0];

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
