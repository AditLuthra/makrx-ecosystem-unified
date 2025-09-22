import { NextResponse } from 'next/server';

export async function getMyRegistrationsDynamic(request: any) {
  const { requireAuth } = await import('@/lib/auth-middleware');
  const { db } = await import('@/lib/db');
  const { registrations, events } = await import('@shared/schema');
  const { eq } = await import('drizzle-orm');
  const { safeDbCall } = await import('@/lib/runtime-guards');

  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    const user = (request as any).user;
    if (!user) {
      return NextResponse.json({ error: 'No user session found' }, { status: 401 });
    }

    // Use safeDbCall to fetch user registrations
    const registrationsWithEvents = await safeDbCall(async () => {
      const userRegistrations = await db
        .select()
        .from(registrations)
        .where(eq(registrations.userId, user.id));

      return await Promise.all(
        userRegistrations.map(async (registration) => {
          let event = undefined;
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
            event,
          };
        }),
      );
    }, []);

    return NextResponse.json(registrationsWithEvents);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}
