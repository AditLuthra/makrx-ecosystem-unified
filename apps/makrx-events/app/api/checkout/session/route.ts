import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const checkoutSessionSchema = z.object({
  micrositeSlug: z.string().min(1),
  subEventSlug: z.string().min(1),
  ticketTierId: z.string().min(1),
  quantity: z.number().min(1).max(10),
  couponCode: z.string().optional(),
  participantInfo: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    organization: z.string().optional(),
  }),
  teamInfo: z
    .object({
      teamName: z.string().optional(),
      teamMembers: z
        .array(
          z.object({
            name: z.string(),
            email: z.string().email(),
            role: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

// POST /api/checkout/session - Create checkout session for paid events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = checkoutSessionSchema.parse(body);

    // Mock data lookups - replace with actual database queries
    const mockSubEvent = {
      id: '2',
      slug: validatedData.subEventSlug,
      title: '3D Printing Mastery Workshop',
      registrationType: 'paid',
      capacity: 25,
      registrationCount: 23,
      ticketingProfileId: 'tp_1',
    };

    const mockTicketTier = {
      id: validatedData.ticketTierId,
      name: 'Regular',
      price: 100.0,
      currency: 'USD',
      quota: 10,
      sold: 8,
      maxPerUser: 1,
      isActive: true,
      taxRate: 0.08,
      feeAbs: 2.5,
      feePct: 0.03,
    };

    // Validate availability
    if (!mockSubEvent || mockSubEvent.slug !== validatedData.subEventSlug) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (mockSubEvent.registrationType !== 'paid') {
      return NextResponse.json({ error: 'This event does not require payment' }, { status: 400 });
    }

    if (!mockTicketTier || !mockTicketTier.isActive) {
      return NextResponse.json({ error: 'Ticket tier not available' }, { status: 400 });
    }

    // Check capacity
    const remainingCapacity = mockTicketTier.quota - mockTicketTier.sold;
    if (remainingCapacity < validatedData.quantity) {
      return NextResponse.json(
        { error: `Only ${remainingCapacity} tickets remaining` },
        { status: 400 },
      );
    }

    // Calculate pricing
    let subtotal = mockTicketTier.price * validatedData.quantity;
    let discount = 0;
    let couponApplied = null;

    // Apply coupon if provided
    if (validatedData.couponCode) {
      // Mock coupon lookup and validation
      const mockCoupon = {
        code: 'STUDENT20',
        discountPct: 20,
        discountAbs: null,
        isActive: true,
        usageLimit: 50,
        usageCount: 12,
        appliesToTierIds: [validatedData.ticketTierId],
      };

      if (mockCoupon && mockCoupon.code === validatedData.couponCode.toUpperCase()) {
        if (mockCoupon.discountPct) {
          discount = subtotal * (mockCoupon.discountPct / 100);
        } else if (mockCoupon.discountAbs) {
          discount = Math.min(mockCoupon.discountAbs * validatedData.quantity, subtotal);
        }
        couponApplied = mockCoupon;
      }
    }

    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * mockTicketTier.taxRate;
    const platformFee = mockTicketTier.feeAbs + discountedSubtotal * mockTicketTier.feePct;
    const total = discountedSubtotal + tax + platformFee;

    // Create pending registration and payment records
    const registrationId = `reg_${Date.now()}`;
    const paymentId = `pay_${Date.now()}`;

    // Mock registration creation
    const pendingRegistration = {
      id: registrationId,
      micrositeId: '1',
      subEventId: mockSubEvent.id,
      ticketTierId: validatedData.ticketTierId,
      quantity: validatedData.quantity,
      status: 'pending',
      paymentRef: paymentId,
      metadata: {
        participantInfo: validatedData.participantInfo,
        teamInfo: validatedData.teamInfo,
        pricing: {
          subtotal,
          discount,
          tax,
          platformFee,
          total,
          couponApplied,
        },
      },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    };

    // Mock payment creation
    const pendingPayment = {
      id: paymentId,
      registrationId,
      amount: total,
      currency: mockTicketTier.currency,
      status: 'created',
      gateway: 'stripe', // or configured gateway
      gatewayPaymentId: null,
      gatewayOrderId: null,
    };

    // Generate checkout session URL (would integrate with actual payment gateway)
    const checkoutUrl = `/checkout/${paymentId}`;

    return NextResponse.json(
      {
        sessionId: paymentId,
        checkoutUrl,
        registration: pendingRegistration,
        payment: pendingPayment,
        pricing: {
          subtotal,
          discount,
          tax,
          platformFee,
          total,
          currency: mockTicketTier.currency,
          couponApplied,
        },
        event: {
          title: mockSubEvent.title,
          slug: mockSubEvent.slug,
        },
        expiresAt: pendingRegistration.expiresAt,
      },
      { status: 201 },
    );
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

    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
