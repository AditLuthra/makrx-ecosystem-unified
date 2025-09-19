import { db } from '@/lib/db';
import { sendRegistrationConfirmationEmail } from '@/lib/email';
import { generateQRCodeImage, generateQRPayload } from '@/lib/qr-utils';
import { microsites, registrations, subEvents, users } from '@shared/schema';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const registrationSchema = z.object({
  subEventId: z.string(),
  participantInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    organization: z.string().optional(),
    dietary: z.string().optional(),
    accessibility: z.string().optional(),
  }),
  answers: z.record(z.string(), z.any()).optional(),
  termsAccepted: z.boolean().refine((val) => val === true, 'Terms must be accepted'),
  marketingConsent: z.boolean().optional(),
});

// POST /api/microsites/[slug]/register
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = registrationSchema.parse(body);

    // Get microsite and sub-event
    const [microsite] = await db
      .select()
      .from(microsites)
      .where(eq(microsites.slug, slug))
      .limit(1);

    if (!microsite) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const [subEvent] = await db
      .select({
        id: subEvents.id,
        title: subEvents.title,
        type: subEvents.type,
        capacity: subEvents.capacity,
        price: subEvents.price,
        registrationType: subEvents.registrationType,
        status: subEvents.status,
        registrationDeadline: subEvents.registrationDeadline,
        startsAt: subEvents.startsAt,
        location: subEvents.location,
      })
      .from(subEvents)
      .where(
        and(eq(subEvents.id, validatedData.subEventId), eq(subEvents.micrositeId, microsite.id)),
      )
      .limit(1);

    if (!subEvent) {
      return NextResponse.json({ error: 'Sub-event not found' }, { status: 404 });
    }

    // Check if event is open for registration
    if (subEvent.status !== 'published') {
      return NextResponse.json(
        { error: 'Registration is not open for this event' },
        { status: 400 },
      );
    }

    // Check registration deadline
    if (subEvent.registrationDeadline && new Date() > new Date(subEvent.registrationDeadline)) {
      return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 });
    }

    // Check capacity (simplified - in real app you'd check current registrations)
    // const currentRegistrations = await db.select().from(registrations)...
    // if (currentRegistrations.length >= subEvent.capacity) { return waitlist logic }

    // Create or get user
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.participantInfo.email))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          id: nanoid(),
          email: validatedData.participantInfo.email,
          firstName: validatedData.participantInfo.firstName,
          lastName: validatedData.participantInfo.lastName,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }

    // Create registration
    const registrationId = nanoid();
    const registration = await db
      .insert(registrations)
      .values({
        userId: user.id,
        micrositeId: microsite.id,
        subEventId: subEvent.id,
        status: subEvent.registrationType === 'free' ? 'confirmed' : 'pending',
        participantInfo: validatedData.participantInfo,
        answers: validatedData.answers || {},
        termsAccepted: validatedData.termsAccepted,
        marketingConsent: validatedData.marketingConsent || false,
        registeredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      .returning();

    // Generate QR code for check-in
    const qrPayload = generateQRPayload(registrationId, subEvent.id, user.id);
    const qrCodeDataUrl = await generateQRCodeImage(qrPayload);

    // Send confirmation email
    if (validatedData.participantInfo.email) {
      try {
        await sendRegistrationConfirmationEmail(validatedData.participantInfo.email, {
          eventTitle: subEvent.title,
          eventDate: subEvent.startsAt ? new Date(subEvent.startsAt).toLocaleDateString() : 'TBD',
          eventLocation: subEvent.location || 'TBD',
          eventSlug: slug,
          participantName: `${validatedData.participantInfo.firstName} ${validatedData.participantInfo.lastName}`,
          registrationType: subEvent.type || 'standard',
          registrationId: registrationId,
          paymentStatus: subEvent.registrationType === 'free' ? 'free' : 'pending',
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the registration if email fails
      }
    }

    const response = {
      success: true,
      registration: {
        id: registrationId,
        status: registration[0].status,
        eventTitle: subEvent.title,
        eventDate: subEvent.startsAt,
        participantName: `${validatedData.participantInfo.firstName} ${validatedData.participantInfo.lastName}`,
        qrCode: qrCodeDataUrl,
      },
      nextSteps:
        subEvent.registrationType === 'paid'
          ? {
              requiresPayment: true,
              amount: subEvent.price,
              paymentUrl: `/m/${slug}/payment/${registrationId}`,
            }
          : {
              requiresPayment: false,
              message: 'Registration complete! You will receive a confirmation email shortly.',
            },
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
