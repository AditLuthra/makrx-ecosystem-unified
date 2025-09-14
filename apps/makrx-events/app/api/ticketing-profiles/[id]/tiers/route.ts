import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertTicketTierSchema } from '@shared/schema';

// GET /api/ticketing-profiles/[id]/tiers - Get all tiers for a ticketing profile
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // Mock data - replace with actual database query
    const mockTiers = [
      {
        id: 'tier_1',
        ticketingProfileId: id,
        name: 'Early Bird',
        price: 75.0,
        currency: 'USD',
        quota: 15,
        sold: 15,
        maxPerUser: 1,
        salesStart: '2024-01-15T00:00:00Z',
        salesEnd: '2024-02-15T23:59:59Z',
        isActive: false,
        description: 'Limited early bird pricing - all materials included',
        taxRate: 0.08,
        feeAbs: 2.5,
        feePct: 0.03,
        metadata: {
          benefits: ['Workshop materials', 'Certificate', 'Lunch'],
          restrictions: ['One per person', 'Non-transferable'],
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-15T14:20:00Z',
      },
      {
        id: 'tier_2',
        ticketingProfileId: id,
        name: 'Regular',
        price: 100.0,
        currency: 'USD',
        quota: 10,
        sold: 8,
        maxPerUser: 1,
        salesStart: '2024-02-16T00:00:00Z',
        salesEnd: '2024-03-14T23:59:59Z',
        isActive: true,
        description: 'Standard workshop admission with all materials',
        taxRate: 0.08,
        feeAbs: 2.5,
        feePct: 0.03,
        metadata: {
          benefits: ['Workshop materials', 'Certificate', 'Lunch'],
          restrictions: ['One per person'],
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-16T08:30:00Z',
      },
    ];

    return NextResponse.json({
      data: mockTiers,
      count: mockTiers.length,
    });
  } catch (error) {
    console.error('Error fetching ticket tiers:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket tiers' }, { status: 500 });
  }
}

// POST /api/ticketing-profiles/[id]/tiers - Create a new ticket tier
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = insertTicketTierSchema.parse(body);

    // Mock creation - replace with actual database insert
    const newTier = {
      id: `tier_${Date.now()}`,
      ticketingProfileId: id,
      name: validatedData.name,
      price: validatedData.price,
      currency: validatedData.currency || 'USD',
      quota: validatedData.quota || null,
      sold: 0,
      maxPerUser: validatedData.maxPerUser || 1,
      salesStart: validatedData.salesStart || new Date().toISOString(),
      salesEnd: validatedData.salesEnd || null,
      isActive: validatedData.isActive ?? true,
      description: validatedData.description || '',
      taxRate: validatedData.taxRate || 0,
      feeAbs: validatedData.feeAbs || 0,
      feePct: validatedData.feePct || 0,
      metadata: validatedData.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(newTier, { status: 201 });
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

    console.error('Error creating ticket tier:', error);
    return NextResponse.json({ error: 'Failed to create ticket tier' }, { status: 500 });
  }
}
