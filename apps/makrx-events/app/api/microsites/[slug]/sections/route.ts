import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertPageSectionSchema } from '@shared/schema';

// GET /api/microsites/[slug]/sections - Get all sections for a microsite
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;

    // Mock data - replace with actual database query
    const mockSections = [
      {
        id: '1',
        micrositeId: '1',
        type: 'hero',
        order: 1,
        isVisible: true,
        contentJson: {
          title: 'MakerFest 2024',
          subtitle: 'The Ultimate Maker Experience',
          description: 'Join thousands of makers for the largest maker festival.',
          backgroundImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          ctaText: 'Register Now',
          ctaUrl: `/m/${slug}/register`,
          startDate: '2024-03-15',
          endDate: '2024-03-17',
          location: 'Moscone Center, San Francisco',
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-01T15:30:00Z',
      },
      {
        id: '2',
        micrositeId: '1',
        type: 'about',
        order: 2,
        isVisible: true,
        contentJson: {
          title: 'About MakerFest 2024',
          description: 'Our festival celebrates the spirit of making and innovation...',
          features: [
            '50+ Interactive Workshops',
            '3 Major Competitions',
            '100+ Vendor Marketplace',
          ],
          stats: [
            { label: 'Expected Attendees', value: '2,000+' },
            { label: 'Workshop Sessions', value: '50+' },
            { label: 'Competition Categories', value: '12' },
          ],
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-01T15:30:00Z',
      },
      {
        id: '3',
        micrositeId: '1',
        type: 'sponsors',
        order: 3,
        isVisible: true,
        contentJson: {
          title: 'Our Partners',
          tiers: ['Gold', 'Silver', 'Bronze'],
          sponsors: {
            Gold: [{ name: 'TechCorp', logoUrl: null, websiteUrl: 'https://techcorp.com' }],
            Silver: [{ name: 'InnovateNow', logoUrl: null, websiteUrl: 'https://innovatenow.com' }],
          },
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-01T15:30:00Z',
      },
    ];

    // Sort by order
    const sortedSections = mockSections.sort((a, b) => a.order - b.order);

    return NextResponse.json({
      data: sortedSections,
      count: sortedSections.length,
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

// POST /api/microsites/[slug]/sections - Create a new section
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = insertPageSectionSchema.parse(body);

    // Get next order number if not provided
    if (!validatedData.order) {
      // Mock getting max order - replace with actual query
      validatedData.order = 10; // Mock next order
    }

    // Mock creation - replace with actual database insert
    const newSection = {
      id: `sec_${Date.now()}`,
      micrositeId: '1', // Would get from microsite lookup
      type: validatedData.type,
      order: validatedData.order,
      isVisible: validatedData.isVisible ?? true,
      contentJson: validatedData.contentJson || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(newSection, { status: 201 });
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

    console.error('Error creating section:', error);
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}
