import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
      eventId,
      userId,
    } = await request.json();

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment verification not configured' }, { status: 500 });
    }

    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transaction reference' }, { status: 400 });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update payment transaction in database
    const { paymentService } = await import('@/lib/payment-service');
    const success = await paymentService.handlePaymentSuccess(transactionId, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!success) {
      return NextResponse.json({ error: 'Payment could not be confirmed' }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      transactionId,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
