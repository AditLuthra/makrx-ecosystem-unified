import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertSubEventSchema } from '@shared/schema';

// GET /api/microsites/[slug]/events - Get all sub-events for a microsite
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    // Query parameters
    const type = searchParams.get('type'); // competition, workshop, talk, expo
    const track = searchParams.get('track'); // robotics, iot, manufacturing, etc.
    const status = searchParams.get('status'); // draft, published, archived
    const registrationType = searchParams.get('registrationType'); // free, paid, external

    // Mock data - replace with actual database query
    const mockSubEvents = [
      {
        id: '1',
        micrositeId: '1',
        slug: 'autonomous-robot-competition',
        title: 'Autonomous Robot Competition',
        type: 'competition',
        track: 'robotics',
        shortDesc: 'Build and program robots to navigate an obstacle course autonomously.',
        longDesc:
          'Teams will design, build, and program autonomous robots capable of navigating complex obstacle courses. Robots must demonstrate advanced sensing, navigation, and decision-making capabilities.',
        rulesMd:
          '# Competition Rules\n\n1. Robots must be fully autonomous\n2. Maximum size: 50cm x 50cm x 50cm\n3. No remote control allowed',
        prizesMd: '# Prizes\n\n- 1st Place: $5,000\n- 2nd Place: $3,000\n- 3rd Place: $1,000',
        startsAt: '2024-03-15T14:00:00Z',
        endsAt: '2024-03-15T18:00:00Z',
        venueId: null,
        registrationType: 'free',
        capacity: 50,
        waitlist: true,
        badgeId: null,
        ticketingProfileId: null,
        status: 'published',
        registrationCount: 23,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-01T15:30:00Z',
      },
      {
        id: '2',
        micrositeId: '1',
        slug: '3d-printing-mastery',
        title: '3D Printing Mastery Workshop',
        type: 'workshop',
        track: 'manufacturing',
        shortDesc: 'Advanced techniques for precision 3D printing and post-processing.',
        longDesc:
          'Learn professional 3D printing techniques including advanced slicing, multi-material printing, and post-processing methods.',
        rulesMd: null,
        prizesMd: null,
        startsAt: '2024-03-15T10:00:00Z',
        endsAt: '2024-03-15T12:00:00Z',
        venueId: null,
        registrationType: 'paid',
        capacity: 25,
        waitlist: false,
        badgeId: null,
        ticketingProfileId: 'tp_1',
        status: 'published',
        registrationCount: 25,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-01T15:30:00Z',
      },
      {
        id: '3',
        micrositeId: '1',
        slug: 'iot-sensors-workshop',
        title: 'IoT Sensor Networks',
        type: 'workshop',
        track: 'iot',
        shortDesc: 'Build wireless sensor networks using Arduino and LoRa.',
        longDesc:
          'Hands-on workshop covering IoT sensor design, wireless communication protocols, and cloud integration.',
        rulesMd: null,
        prizesMd: null,
        startsAt: '2024-03-16T09:00:00Z',
        endsAt: '2024-03-16T11:00:00Z',
        venueId: null,
        registrationType: 'free',
        capacity: 30,
        waitlist: true,
        badgeId: null,
        ticketingProfileId: null,
        status: 'draft',
        registrationCount: 0,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-01T15:30:00Z',
      },
    ];

    // Apply filters
    let filteredEvents = mockSubEvents;

    if (type) {
      filteredEvents = filteredEvents.filter((e) => e.type === type);
    }

    if (track) {
      filteredEvents = filteredEvents.filter((e) => e.track === track);
    }

    if (status) {
      filteredEvents = filteredEvents.filter((e) => e.status === status);
    }

    if (registrationType) {
      filteredEvents = filteredEvents.filter((e) => e.registrationType === registrationType);
    }

    return NextResponse.json({
      data: filteredEvents,
      count: filteredEvents.length,
      filters: {
        types: ['competition', 'workshop', 'talk', 'expo'],
        tracks: ['robotics', 'iot', 'manufacturing', 'electronics', 'software', 'creative'],
        statuses: ['draft', 'published', 'archived'],
        registrationTypes: ['free', 'paid', 'external'],
      },
    });
  } catch (error) {
    console.error('Error fetching sub-events:', error);
    return NextResponse.json({ error: 'Failed to fetch sub-events' }, { status: 500 });
  }
}

// POST /api/microsites/[slug]/events - Create a new sub-event
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = insertSubEventSchema.parse(body);

    // Generate slug from title if not provided
    if (!validatedData.slug) {
      validatedData.slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Mock creation - replace with actual database insert
    const newSubEvent = {
      id: `se_${Date.now()}`,
      micrositeId: '1', // Would get from microsite lookup
      slug: validatedData.slug,
      title: validatedData.title,
      type: validatedData.type,
      track: validatedData.track || null,
      shortDesc: validatedData.shortDesc || '',
      longDesc: validatedData.longDesc || '',
      rulesMd: validatedData.rulesMd || null,
      prizesMd: validatedData.prizesMd || null,
      startsAt: validatedData.startsAt,
      endsAt: validatedData.endsAt,
      venueId: validatedData.venueId || null,
      registrationType: validatedData.registrationType || 'free',
      capacity: validatedData.capacity || null,
      waitlist: validatedData.waitlist || false,
      badgeId: validatedData.badgeId || null,
      ticketingProfileId: validatedData.ticketingProfileId || null,
      status: 'draft',
      registrationCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(newSubEvent, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 },
      );
    }

    console.error('Error creating sub-event:', error);
    return NextResponse.json({ error: 'Failed to create sub-event' }, { status: 500 });
  }
}
