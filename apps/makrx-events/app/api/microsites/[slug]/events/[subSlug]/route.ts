import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertSubEventSchema } from '@shared/schema';

// GET /api/microsites/[slug]/events/[subSlug] - Get specific sub-event
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; subSlug: string } },
) {
  try {
    const { slug, subSlug } = await params;

    // Mock data - replace with actual database query
    const mockSubEvent = {
      id: '1',
      micrositeId: '1',
      slug: subSlug,
      title: 'Autonomous Robot Competition',
      type: 'competition',
      track: 'robotics',
      shortDesc: 'Build and program robots to navigate an obstacle course autonomously.',
      longDesc:
        'Teams will design, build, and program autonomous robots capable of navigating complex obstacle courses. Robots must demonstrate advanced sensing, navigation, and decision-making capabilities.',
      rulesMd: `# Competition Rules

## General Rules
1. Robots must be fully autonomous during the competition
2. Maximum robot dimensions: 50cm x 50cm x 50cm
3. Maximum weight: 10kg
4. No remote control or human intervention allowed during runs

## Technical Requirements
- Robots must use onboard sensors only
- External communication is prohibited
- Power source must be self-contained
- All code must be uploaded before the competition starts

## Scoring
- Points awarded for completing checkpoints
- Time penalties for each retry
- Bonus points for innovative solutions`,
      prizesMd: `# Prize Pool: $9,000

## Awards
- **1st Place**: $5,000 + Trophy
- **2nd Place**: $3,000 + Medal  
- **3rd Place**: $1,000 + Medal
- **Best Innovation**: $500 Special Award
- **People's Choice**: $500 Special Award`,
      startsAt: '2024-03-15T14:00:00Z',
      endsAt: '2024-03-15T18:00:00Z',
      venueId: null,
      venue: {
        name: 'Competition Arena',
        location: 'Main Hall, Level 2',
        capacity: 200,
      },
      registrationType: 'free',
      capacity: 50,
      waitlist: true,
      badgeId: null,
      ticketingProfileId: null,
      status: 'published',
      registrationCount: 23,
      waitlistCount: 5,
      judges: [
        {
          name: 'Dr. Sarah Chen',
          title: 'Robotics Engineer, Tesla',
          bio: 'Leading expert in autonomous systems with 15+ years experience.',
        },
        {
          name: 'Mike Rodriguez',
          title: 'Founder, RoboTech Labs',
          bio: 'Serial entrepreneur and robotics competition organizer.',
        },
      ],
      schedule: [
        { time: '14:00', activity: 'Registration & Setup' },
        { time: '14:30', activity: 'Technical Inspection' },
        { time: '15:00', activity: 'Competition Briefing' },
        { time: '15:30', activity: 'Round 1 - Qualifying' },
        { time: '16:30', activity: 'Round 2 - Semi-Finals' },
        { time: '17:30', activity: 'Final Round' },
        { time: '18:00', activity: 'Awards Ceremony' },
      ],
      requirements: [
        'Basic knowledge of robotics and programming',
        'Team of 2-4 members (individuals welcome)',
        'Bring your own laptop for programming',
        'Robot kit provided or bring your own',
      ],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-01T15:30:00Z',
    };

    if (mockSubEvent.slug !== subSlug) {
      return NextResponse.json({ error: 'Sub-event not found' }, { status: 404 });
    }

    return NextResponse.json(mockSubEvent);
  } catch (error) {
    console.error('Error fetching sub-event:', error);
    return NextResponse.json({ error: 'Failed to fetch sub-event' }, { status: 500 });
  }
}

// PATCH /api/microsites/[slug]/events/[subSlug] - Update sub-event
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; subSlug: string } },
) {
  try {
    const { slug, subSlug } = await params;
    const body = await request.json();

    // Partial validation
    const partialSchema = insertSubEventSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Mock update - replace with actual database update
    const updatedSubEvent = {
      id: '1',
      micrositeId: '1',
      slug: subSlug,
      title: validatedData.title || 'Autonomous Robot Competition',
      type: validatedData.type || 'competition',
      track: validatedData.track || 'robotics',
      shortDesc: validatedData.shortDesc || 'Build and program robots...',
      longDesc: validatedData.longDesc || 'Teams will design...',
      rulesMd: validatedData.rulesMd || null,
      prizesMd: validatedData.prizesMd || null,
      startsAt: validatedData.startsAt || '2024-03-15T14:00:00Z',
      endsAt: validatedData.endsAt || '2024-03-15T18:00:00Z',
      venueId: validatedData.venueId || null,
      registrationType: validatedData.registrationType || 'free',
      capacity: validatedData.capacity || 50,
      waitlist: validatedData.waitlist ?? true,
      badgeId: validatedData.badgeId || null,
      ticketingProfileId: validatedData.ticketingProfileId || null,
      status: validatedData.status || 'published',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedSubEvent);
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

    console.error('Error updating sub-event:', error);
    return NextResponse.json({ error: 'Failed to update sub-event' }, { status: 500 });
  }
}

// DELETE /api/microsites/[slug]/events/[subSlug] - Delete sub-event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; subSlug: string } },
) {
  try {
    const { slug, subSlug } = await params;

    // TODO: Check if sub-event has active registrations
    // TODO: Handle cancellation notifications
    // TODO: Handle refunds if paid event

    // Mock deletion - replace with actual database delete
    console.log(`Deleting sub-event ${subSlug} from microsite ${slug}`);

    return NextResponse.json({ message: 'Sub-event deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting sub-event:', error);
    return NextResponse.json({ error: 'Failed to delete sub-event' }, { status: 500 });
  }
}
