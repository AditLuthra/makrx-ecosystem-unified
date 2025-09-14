import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertCouponSchema } from '@shared/schema';

// GET /api/ticketing-profiles/[id]/coupons - Get all coupons for a ticketing profile
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // Mock data - replace with actual database query
    const mockCoupons = [
      {
        id: 'coupon_1',
        ticketingProfileId: id,
        code: 'STUDENT20',
        discountPct: 20,
        discountAbs: null,
        usageLimit: 50,
        usageCount: 12,
        expiresAt: '2024-03-14T23:59:59Z',
        appliesToTierIds: ['tier_1', 'tier_2'],
        isActive: true,
        description: '20% student discount',
        metadata: {
          requiresVerification: true,
          validDomains: ['edu', 'ac.uk'],
          createdBy: 'admin@makrx.events',
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-01T09:15:00Z',
      },
      {
        id: 'coupon_2',
        ticketingProfileId: id,
        code: 'EARLY50',
        discountAbs: 50.0,
        discountPct: null,
        usageLimit: 10,
        usageCount: 8,
        expiresAt: '2024-02-15T23:59:59Z',
        appliesToTierIds: ['tier_2'],
        isActive: false,
        description: '$50 off early registration',
        metadata: {
          requiresVerification: false,
          createdBy: 'admin@makrx.events',
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-15T14:20:00Z',
      },
    ];

    return NextResponse.json({
      data: mockCoupons,
      count: mockCoupons.length,
      stats: {
        activeCount: mockCoupons.filter((c) => c.isActive).length,
        totalUsage: mockCoupons.reduce((sum, c) => sum + c.usageCount, 0),
        totalSavings: 890.0, // Mock calculation
      },
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

// POST /api/ticketing-profiles/[id]/coupons - Create a new coupon
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = insertCouponSchema.parse(body);

    // Validate that exactly one discount type is provided
    if (!validatedData.discountAbs && !validatedData.discountPct) {
      return NextResponse.json(
        { error: 'Either discountAbs or discountPct must be provided' },
        { status: 400 },
      );
    }

    if (validatedData.discountAbs && validatedData.discountPct) {
      return NextResponse.json(
        { error: 'Only one discount type (absolute or percentage) can be set' },
        { status: 400 },
      );
    }

    // Check if coupon code already exists
    // TODO: Implement actual uniqueness check

    // Mock creation - replace with actual database insert
    const newCoupon = {
      id: `coupon_${Date.now()}`,
      ticketingProfileId: id,
      code: validatedData.code.toUpperCase(),
      discountAbs: validatedData.discountAbs || null,
      discountPct: validatedData.discountPct || null,
      usageLimit: validatedData.usageLimit || null,
      usageCount: 0,
      expiresAt: validatedData.expiresAt || null,
      appliesToTierIds: validatedData.appliesToTierIds || [],
      isActive: validatedData.isActive ?? true,
      description: validatedData.description || '',
      metadata: validatedData.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
