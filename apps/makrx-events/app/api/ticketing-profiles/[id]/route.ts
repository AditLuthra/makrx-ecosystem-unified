import { insertTicketingProfileSchema } from '@shared/schema';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// GET /api/ticketing-profiles/[id] - Get specific ticketing profile
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // Mock data - replace with actual database query
    const mockProfile = {
      id,
      micrositeId: '1',
      subEventId: '2',
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
          taxRate: 0.08,
          feeAbs: 2.5,
          feePct: 0.03,
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
          appliesToTierIds: ['tier_1'],
          isActive: true,
        },
      ],
      stats: {
        totalRevenue: 1125.0,
        totalSold: 15,
        averageTicketPrice: 75.0,
        conversionRate: 0.65,
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-15T14:20:00Z',
    };

    return NextResponse.json(mockProfile);
  } catch (error) {
    console.error('Error fetching ticketing profile:', error);
    return NextResponse.json({ error: 'Failed to fetch ticketing profile' }, { status: 500 });
  }
}

// PATCH /api/ticketing-profiles/[id] - Update ticketing profile
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Partial validation
    const partialSchema = insertTicketingProfileSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Mock update - replace with actual database update
    const updatedProfile = {
      id,
      micrositeId: validatedData.micrositeId || '1',
      subEventId: validatedData.subEventId || '2',
      currency: validatedData.currency || 'USD',
      refundPolicy: validatedData.refundPolicy || 'Full refund up to 48 hours...',
      notes: validatedData.notes || 'All materials included...',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedProfile);
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

    console.error('Error updating ticketing profile:', error);
    return NextResponse.json({ error: 'Failed to update ticketing profile' }, { status: 500 });
  }
}

// DELETE /api/ticketing-profiles/[id] - Delete ticketing profile
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // TODO: Check if profile has active sales
    // TODO: Handle existing registrations
    // TODO: Archive instead of hard delete if has history

    // Mock deletion - replace with actual database delete
    console.log(`Deleting ticketing profile: ${id}`);

    return NextResponse.json(
      { message: 'Ticketing profile deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting ticketing profile:', error);
    return NextResponse.json({ error: 'Failed to delete ticketing profile' }, { status: 500 });
  }
}
