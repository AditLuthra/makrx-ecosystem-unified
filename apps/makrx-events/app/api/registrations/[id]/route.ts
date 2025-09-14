import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations, subEvents, microsites, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// GET /api/registrations/[id] - Get registration details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    const [registration] = await db
      .select({
        id: registrations.id,
        status: registrations.status,
        participantInfo: registrations.participantInfo,
        registeredAt: registrations.registeredAt,
        paidAt: registrations.paidAt,
        checkedInAt: registrations.checkedInAt,
        paymentIntentId: registrations.paymentIntentId,
        eventTitle: subEvents.title,
        eventType: subEvents.type,
        eventPrice: subEvents.price,
        eventCurrency: subEvents.currency,
        eventStartsAt: subEvents.startsAt,
        eventLocation: subEvents.location,
        micrositeTitle: microsites.title,
        micrositeSlug: microsites.slug,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
      })
      .from(registrations)
      .leftJoin(subEvents, eq(registrations.subEventId, subEvents.id))
      .leftJoin(microsites, eq(registrations.micrositeId, microsites.id))
      .leftJoin(users, eq(registrations.userId, users.id))
      .where(eq(registrations.id, id))
      .limit(1);

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Calculate payment expiry (24 hours from registration for pending payments)
    const paymentExpiresAt =
      registration.status === 'pending'
        ? new Date(
            new Date(registration.registeredAt).getTime() + 24 * 60 * 60 * 1000,
          ).toISOString()
        : null;

    const response = {
      registration: {
        id: registration.id,
        eventTitle: `${registration.micrositeTitle} - ${registration.eventTitle}`,
        eventDate: registration.eventStartsAt,
        eventLocation: registration.eventLocation || 'TBD',
        participantName:
          `${registration.userFirstName || ''} ${registration.userLastName || ''}`.trim(),
        email: registration.userEmail,
        amount: registration.eventPrice || 0,
        currency: registration.eventCurrency || 'USD',
        status: registration.status,
        registeredAt: registration.registeredAt,
        paidAt: registration.paidAt,
        checkedInAt: registration.checkedInAt,
        expiresAt: paymentExpiresAt,
        participantInfo: registration.participantInfo,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json({ error: 'Failed to fetch registration' }, { status: 500 });
  }
}

// PUT /api/registrations/[id] - Update registration
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if registration exists
    const [existingRegistration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, id))
      .limit(1);

    if (!existingRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Update registration
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.participantInfo) {
      updateData.participantInfo = body.participantInfo;
    }

    if (body.status) {
      updateData.status = body.status;
    }

    if (body.answers) {
      updateData.answers = body.answers;
    }

    const [updatedRegistration] = await db
      .update(registrations)
      .set(updateData)
      .where(eq(registrations.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
  }
}

// DELETE /api/registrations/[id] - Cancel registration
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // Check if registration exists
    const [existingRegistration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, id))
      .limit(1);

    if (!existingRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Soft delete by updating status
    await db
      .update(registrations)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(registrations.id, id));

    // TODO: Handle refunds if applicable
    // TODO: Send cancellation email
    // TODO: Update event capacity

    return NextResponse.json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 });
  }
}
