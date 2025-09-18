import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paymentService } from '@/lib/payment-service';

const createOrderSchema = z.object({
  registrationId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  eventId: z.string().min(1),
  userId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { registrationId, amount, currency, eventId, userId } = createOrderSchema.parse(body);

    const result = await paymentService.processRegistrationPayment(
      registrationId,
      amount,
      'razorpay',
      eventId,
      userId,
    );

    if (!result.orderId) {
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 502 });
    }

    return NextResponse.json({
      orderId: result.orderId,
      amount: result.amount ?? Math.round(amount * 100),
      currency: result.currency ?? currency,
      key: process.env.RAZORPAY_KEY_ID,
      transactionId: result.transactionId,
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

    console.error('Error creating payment order:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
