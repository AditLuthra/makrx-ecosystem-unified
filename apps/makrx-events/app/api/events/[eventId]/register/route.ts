import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventRegistrations, events, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { sendRegistrationConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const { userId, type, paymentIntentId } = await request.json();

    // Get event details
    const event = await db.select().from(events).where(eq(events.id, params.eventId)).limit(1);

    if (!event.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get user details
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already registered
    const existingRegistration = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(eq(eventRegistrations.eventId, params.eventId), eq(eventRegistrations.userId, userId)),
      )
      .limit(1);

    if (existingRegistration.length) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    // Create registration
    const [registration] = await db
      .insert(eventRegistrations)
      .values({
        eventId: params.eventId,
        userId,
        type,
        status: 'confirmed',
        paymentStatus: paymentIntentId ? 'paid' : 'pending',
        paymentIntentId,
      })
      .returning();

    // Send confirmation email
    if (user[0].email) {
      const eventDate = new Date(event[0].startDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const emailResult = await sendRegistrationConfirmationEmail(user[0].email, {
        eventTitle: event[0].title,
        eventDate,
        eventLocation: event[0].location,
        eventSlug: event[0].slug,
        participantName:
          `${user[0].firstName || ''} ${user[0].lastName || ''}`.trim() || 'Participant',
        registrationType: type,
        registrationId: registration.id,
        paymentStatus: registration.paymentStatus || 'pending',
      });

      if (!emailResult.success) {
        console.warn('Failed to send confirmation email:', emailResult.error);
      }
    }

    return NextResponse.json(
      {
        registration,
        message: 'Registration successful! Confirmation email sent.',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 });
  }
}
