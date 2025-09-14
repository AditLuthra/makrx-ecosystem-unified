import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendRegistrationConfirmationEmail } from '@/lib/email';

const emailSchema = z.object({
  to: z.string().email(),
  eventTitle: z.string(),
  eventDate: z.string(),
  eventLocation: z.string(),
  eventSlug: z.string(),
  participantName: z.string(),
  registrationType: z.string(),
  registrationId: z.string(),
  paymentStatus: z.string().optional(),
});

// POST /api/emails/send-registration-confirmation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = emailSchema.parse(body);

    // Send email
    const result = await sendRegistrationConfirmationEmail(validatedData.to, validatedData);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Registration confirmation email sent successfully',
      emailSent: true,
    });
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

    console.error('Error sending registration confirmation email:', error);
    return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 });
  }
}
