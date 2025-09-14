import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertMicrositeRegistrationSchema } from '@shared/schema';

const registrationSchema = z.object({
  userId: z.string().optional(), // May be null for guest registrations
  participantInfo: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    organization: z.string().optional(),
    dietaryRestrictions: z.string().optional(),
    emergencyContact: z.string().optional()
  }),
  teamInfo: z.object({
    teamName: z.string().optional(),
    teamMembers: z.array(z.object({
      name: z.string(),
      email: z.string().email(),
      role: z.string().optional()
    })).optional()
  }).optional(),
  ticketTierId: z.string().optional(), // For paid events
  quantity: z.number().min(1).max(10).default(1),
  couponCode: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// POST /api/microsites/[slug]/events/[subSlug]/register - Register for free event
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; subSlug: string } }
) {
  try {
    const { slug, subSlug } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = registrationSchema.parse(body);

    // Mock sub-event lookup - replace with actual database query
    const mockSubEvent = {
      id: '1',
      slug: subSlug,
      title: 'Autonomous Robot Competition',
      registrationType: 'free',
      capacity: 50,
      registrationCount: 23,
      waitlist: true,
      status: 'published'
    };

    if (mockSubEvent.slug !== subSlug) {
      return NextResponse.json(
        { error: 'Sub-event not found' },
        { status: 404 }
      );
    }

    if (mockSubEvent.status !== 'published') {
      return NextResponse.json(
        { error: 'Registration not available for this event' },
        { status: 400 }
      );
    }

    if (mockSubEvent.registrationType !== 'free') {
      return NextResponse.json(
        { error: 'This is a paid event. Use the checkout endpoint instead.' },
        { status: 400 }
      );
    }

    // Check capacity
    const isWaitlist = mockSubEvent.capacity && 
      mockSubEvent.registrationCount >= mockSubEvent.capacity;

    if (isWaitlist && !mockSubEvent.waitlist) {
      return NextResponse.json(
        { error: 'Event is full and waitlist is not enabled' },
        { status: 400 }
      );
    }

    // Generate QR code for ticket
    const qrCode = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Mock registration creation - replace with actual database insert
    const newRegistration = {
      id: `reg_${Date.now()}`,
      userId: validatedData.userId || null,
      micrositeId: '1',
      subEventId: mockSubEvent.id,
      ticketTierId: null,
      quantity: validatedData.quantity,
      status: isWaitlist ? 'waitlisted' : 'confirmed',
      paymentRef: null,
      qrCode: isWaitlist ? null : qrCode,
      metadata: {
        participantInfo: validatedData.participantInfo,
        teamInfo: validatedData.teamInfo,
        registeredVia: 'web',
        isWaitlist
      },
      registeredAt: new Date().toISOString()
    };

    // TODO: Send confirmation email
    // TODO: Update event registration count
    // TODO: Generate calendar invite

    return NextResponse.json({
      registration: newRegistration,
      event: {
        title: mockSubEvent.title,
        slug: mockSubEvent.slug
      },
      message: isWaitlist 
        ? 'You have been added to the waitlist. You will be notified if a spot becomes available.'
        : 'Registration successful! Your ticket has been generated.',
      ticket: isWaitlist ? null : {
        qrCode,
        downloadUrl: `/api/tickets/${newRegistration.id}/pdf`
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('Error processing registration:', error);
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    );
  }
}