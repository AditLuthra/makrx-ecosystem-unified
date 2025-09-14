import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertTicketingProfileSchema } from '@shared/schema';

// GET /api/ticketing-profiles - Get ticketing profiles with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const micrositeId = searchParams.get('micrositeId');
    const subEventId = searchParams.get('subEventId');

    // Mock data - replace with actual database query
    const mockProfiles = [
      {
        id: 'tp_1',
        micrositeId: '1',
        subEventId: '2', // 3D Printing Workshop
        currency: 'USD',
        refundPolicy:
          'Full refund up to 48 hours before event. 50% refund up to 24 hours. No refund after.',
        notes: 'All materials included. Bring laptop if you have one.',
        tiers: [
          {
            id: 'tier_1',
            name: 'Early Bird',
            price: 75.0,
            currency: 'USD',
            quota: 15,
            sold: 15,
            maxPerUser: 1,
            salesStart: '2024-01-15T00:00:00Z',
            salesEnd: '2024-02-15T23:59:59Z',
            isActive: false,
            description: 'Limited early bird pricing',
          },
          {
            id: 'tier_2',
            name: 'Regular',
            price: 100.0,
            currency: 'USD',
            quota: 10,
            sold: 8,
            maxPerUser: 1,
            salesStart: '2024-02-16T00:00:00Z',
            salesEnd: '2024-03-14T23:59:59Z',
            isActive: true,
            description: 'Standard workshop admission',
          },
        ],
        coupons: [
          {
            id: 'coupon_1',
            code: 'STUDENT20',
            discountPct: 20,
            discountAbs: null,
            usageLimit: 50,
            usageCount: 12,
            expiresAt: '2024-03-14T23:59:59Z',
            appliesToTierIds: ['tier_1', 'tier_2'],
            isActive: true,
          },
        ],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-15T14:20:00Z',
      },
      {
        id: 'tp_2',
        micrositeId: '1',
        subEventId: null, // Microsite-level profile
        currency: 'USD',
        refundPolicy: 'Standard refund policy applies.',
        notes: 'General admission to all microsite events.',
        tiers: [
          {
            id: 'tier_3',
            name: 'VIP Pass',
            price: 299.0,
            currency: 'USD',
            quota: 25,
            sold: 8,
            maxPerUser: 1,
            salesStart: '2024-01-15T00:00:00Z',
            salesEnd: '2024-03-15T00:00:00Z',
            isActive: true,
            description: 'Access to all events plus VIP perks',
          },
        ],
        coupons: [],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-01T09:15:00Z',
      },
    ];

    // Apply filters
    let filteredProfiles = mockProfiles;

    if (micrositeId) {
      filteredProfiles = filteredProfiles.filter((p) => p.micrositeId === micrositeId);
    }

    if (subEventId) {
      filteredProfiles = filteredProfiles.filter((p) => p.subEventId === subEventId);
    }

    return NextResponse.json({
      data: filteredProfiles,
      count: filteredProfiles.length,
    });
  } catch (error) {
    console.error('Error fetching ticketing profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch ticketing profiles' }, { status: 500 });
  }
}

// POST /api/ticketing-profiles - Create a new ticketing profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = insertTicketingProfileSchema.parse(body);

    // Mock creation - replace with actual database insert
    const newProfile = {
      id: `tp_${Date.now()}`,
      micrositeId: validatedData.micrositeId,
      subEventId: validatedData.subEventId || null,
      currency: validatedData.currency || 'USD',
      refundPolicy: validatedData.refundPolicy || 'Standard refund policy applies.',
      notes: validatedData.notes || '',
      tiers: [], // Created separately
      coupons: [], // Created separately
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(newProfile, { status: 201 });
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

    console.error('Error creating ticketing profile:', error);
    return NextResponse.json({ error: 'Failed to create ticketing profile' }, { status: 500 });
  }
}
