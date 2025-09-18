import { NextResponse } from 'next/server';

// Stripe-based payment intents are no longer exposed; Razorpay is the supported provider.
export async function POST() {
  return NextResponse.json(
    { error: 'Stripe payment intents are disabled. Razorpay is the configured provider for event payments.' },
    { status: 410 },
  );
}
