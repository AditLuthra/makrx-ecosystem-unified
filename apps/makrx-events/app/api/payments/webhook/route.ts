import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Webhook payload schema (simplified)
const webhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.object({
      id: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      metadata: z.record(z.string()).optional(),
    }),
  }),
  created: z.number(),
});

// POST /api/payments/webhook - Handle payment gateway webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature =
      request.headers.get('stripe-signature') ||
      request.headers.get('x-razorpay-signature') ||
      request.headers.get('authorization');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 401 });
    }

    // TODO: Verify webhook signature with gateway
    // For Stripe: stripe.webhooks.constructEvent(body, signature, endpointSecret)
    // For Razorpay: validateWebhookSignature(body, signature, secret)

    const payload = JSON.parse(body);
    const validatedPayload = webhookSchema.parse(payload);

    const { type, data } = validatedPayload;
    const paymentObject = data.object;

    console.log(`Received webhook: ${type} for payment ${paymentObject.id}`);

    // Handle different webhook events
    switch (type) {
      case 'payment_intent.succeeded':
      case 'payment.captured':
        await handlePaymentSuccess(paymentObject);
        break;

      case 'payment_intent.payment_failed':
      case 'payment.failed':
        await handlePaymentFailure(paymentObject);
        break;

      case 'payment_intent.canceled':
      case 'payment.cancelled':
        await handlePaymentCancellation(paymentObject);
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}

async function handlePaymentSuccess(paymentObject: any) {
  try {
    // Extract registration ID from metadata
    const registrationId = paymentObject.metadata?.registrationId;

    if (!registrationId) {
      console.error('No registrationId in payment metadata');
      return;
    }

    // Mock database updates - replace with actual queries
    console.log(`Processing successful payment for registration: ${registrationId}`);

    // 1. Update payment status
    const updatedPayment = {
      id: paymentObject.id,
      status: 'captured',
      gatewayPaymentId: paymentObject.id,
      amount: paymentObject.amount / 100, // Convert from cents
      currency: paymentObject.currency.toUpperCase(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Update registration status and generate QR code
    const qrCode = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const updatedRegistration = {
      id: registrationId,
      status: 'confirmed',
      qrCode,
      confirmedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3. Update event registration count
    // TODO: Increment event registration count

    // 4. Send confirmation email
    // TODO: Send email with ticket and QR code

    // 5. Generate calendar invite
    // TODO: Create .ics file for download

    console.log('Payment processed successfully:', {
      payment: updatedPayment,
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentObject: any) {
  try {
    const registrationId = paymentObject.metadata?.registrationId;

    if (!registrationId) {
      console.error('No registrationId in payment metadata');
      return;
    }

    console.log(`Processing failed payment for registration: ${registrationId}`);

    // Update payment and registration status
    const updatedPayment = {
      id: paymentObject.id,
      status: 'failed',
      gatewayPaymentId: paymentObject.id,
      updatedAt: new Date().toISOString(),
    };

    const updatedRegistration = {
      id: registrationId,
      status: 'payment_failed',
      updatedAt: new Date().toISOString(),
    };

    // TODO: Send payment failure notification
    // TODO: Release held inventory/capacity

    console.log('Payment failure processed:', {
      payment: updatedPayment,
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handlePaymentCancellation(paymentObject: any) {
  try {
    const registrationId = paymentObject.metadata?.registrationId;

    if (!registrationId) {
      console.error('No registrationId in payment metadata');
      return;
    }

    console.log(`Processing cancelled payment for registration: ${registrationId}`);

    // Update payment and registration status
    const updatedPayment = {
      id: paymentObject.id,
      status: 'cancelled',
      gatewayPaymentId: paymentObject.id,
      updatedAt: new Date().toISOString(),
    };

    const updatedRegistration = {
      id: registrationId,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };

    // TODO: Release held inventory/capacity
    // TODO: Send cancellation confirmation if needed

    console.log('Payment cancellation processed:', {
      payment: updatedPayment,
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}
