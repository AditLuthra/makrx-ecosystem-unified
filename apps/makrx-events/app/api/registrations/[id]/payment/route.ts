import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { registrations } from '@shared/schema';
import { eq } from 'drizzle-orm';

const paymentUpdateSchema = z.object({
  paymentIntentId: z.string(),
  status: z.enum(['paid', 'failed', 'cancelled']),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
});

// POST /api/registrations/[id]/payment - Update payment status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = paymentUpdateSchema.parse(body);

    // Check if registration exists
    const [registration] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, id))
      .limit(1);

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Update registration with payment information
    const updateData: any = {
      paymentIntentId: validatedData.paymentIntentId,
      status: validatedData.status,
      updatedAt: new Date(),
    };

    if (validatedData.status === 'paid') {
      updateData.paidAt = new Date();
      updateData.status = 'confirmed';
    }

    if (validatedData.paymentMethod) {
      updateData.metadata = {
        ...registration.metadata,
        paymentMethod: validatedData.paymentMethod,
        transactionId: validatedData.transactionId,
      };
    }

    await db
      .update(registrations)
      .set(updateData)
      .where(eq(registrations.id, id));

    return NextResponse.json({
      success: true,
      registration: {
        id: registration.id,
        status: updateData.status,
        paidAt: updateData.paidAt,
      }
    });

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

    console.error('Payment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}

// GET /api/registrations/[id]/payment - Get payment status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const [registration] = await db
      .select({
        id: registrations.id,
        status: registrations.status,
        paymentIntentId: registrations.paymentIntentId,
        paidAt: registrations.paidAt,
        metadata: registrations.metadata,
      })
      .from(registrations)
      .where(eq(registrations.id, id))
      .limit(1);

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      registration: {
        id: registration.id,
        status: registration.status,
        paymentIntentId: registration.paymentIntentId,
        paidAt: registration.paidAt,
        isPaid: registration.status === 'confirmed' || registration.status === 'paid',
        paymentMethod: registration.metadata?.paymentMethod,
      }
    });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
