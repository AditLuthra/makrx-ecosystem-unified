import { requireAuth, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import { events, registrations, type Event, type EventRegistration } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authResult = await requireAuth(request as any);
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    // Get user from request
    const authenticatedRequest = request as AuthenticatedRequest;
    const user = authenticatedRequest.user;

    if (!user) {
      return NextResponse.json({ error: 'No user session found' }, { status: 401 });
    }

    // Fetch user registrations from database
    // Fetch user registrations from the database
    const userRegistrations: EventRegistration[] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.userId, user.id));

    // Transform data to include event details
    const registrationsWithEvents = await Promise.all(
      userRegistrations.map(async (registration: EventRegistration) => {
        let event: Event | undefined = undefined;
        if (registration.eventId) {
          const eventResult = await db
            .select()
            .from(events)
            .where(eq(events.id, registration.eventId));
          event = eventResult[0];
        }
        return {
          id: registration.id,
          type: registration.type,
          status: registration.status,
          registeredAt: registration.registeredAt,
          event: event
            ? {
                id: event.id,
                title: event.title,
                startDate: event.startDate,
                endDate: event.endDate,
                location: event.location,
                featuredImage: event.featuredImage,
              }
            : null,
        };
      }),
    );

    return NextResponse.json(registrationsWithEvents);
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}
