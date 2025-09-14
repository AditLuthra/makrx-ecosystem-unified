import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertMicrositeSchema } from '@shared/schema';

// GET /api/microsites/[slug] - Get microsite by slug
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;

    // Mock data - replace with actual database query
    const mockMicrosite = {
      id: '1',
      slug: 'makerfest-2024',
      title: 'MakerFest 2024',
      subtitle: 'The Ultimate Maker Experience',
      description:
        'Join thousands of makers, inventors, and technology enthusiasts for the largest maker festival on the West Coast.',
      status: 'published',
      hostType: 'MakrCave',
      hostRef: null,
      startsAt: '2024-03-15T09:00:00Z',
      endsAt: '2024-03-17T18:00:00Z',
      templateId: 'festival-classic',
      themeId: 'blue-theme',
      visibility: 'public',
      seo: {
        title: 'MakerFest 2024 - The Ultimate Maker Experience',
        description:
          'Join thousands of makers for the largest maker festival on the West Coast. March 15-17, 2024.',
        ogImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      },
      settings: {
        enableTracks: true,
        enableSpeakers: true,
        enableRegistration: true,
        enableTicketing: true,
        enableSponsors: true,
      },
      theme: {
        id: 'blue-theme',
        name: 'Blue Theme',
        tokens: {
          primary: '#3B82F6',
          accent: '#8B5CF6',
          background: '#FFFFFF',
          foreground: '#1F2937',
        },
        assets: {
          logoUrl: null,
          heroUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          faviconUrl: null,
        },
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-01T15:30:00Z',
    };

    if (mockMicrosite.slug !== slug) {
      return NextResponse.json({ error: 'Microsite not found' }, { status: 404 });
    }

    return NextResponse.json(mockMicrosite);
  } catch (error) {
    console.error('Error fetching microsite:', error);
    return NextResponse.json({ error: 'Failed to fetch microsite' }, { status: 500 });
  }
}

// PATCH /api/microsites/[slug] - Update microsite
export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Partial validation - only validate provided fields
    const partialSchema = insertMicrositeSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Mock update - replace with actual database update
    const updatedMicrosite = {
      id: '1',
      slug,
      title: validatedData.title || 'MakerFest 2024',
      subtitle: validatedData.subtitle || 'The Ultimate Maker Experience',
      description: validatedData.description || 'Join thousands of makers...',
      status: validatedData.status || 'published',
      hostType: validatedData.hostType || 'MakrCave',
      startsAt: validatedData.startsAt || '2024-03-15T09:00:00Z',
      endsAt: validatedData.endsAt || '2024-03-17T18:00:00Z',
      templateId: validatedData.templateId || 'festival-classic',
      themeId: validatedData.themeId || 'blue-theme',
      visibility: validatedData.visibility || 'public',
      seo: validatedData.seo || {},
      settings: validatedData.settings || {},
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedMicrosite);
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

    console.error('Error updating microsite:', error);
    return NextResponse.json({ error: 'Failed to update microsite' }, { status: 500 });
  }
}

// DELETE /api/microsites/[slug] - Delete microsite
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;

    // TODO: Check if user has permission to delete this microsite
    // TODO: Check if microsite has active registrations/payments
    // TODO: Handle cascading deletes for sections, events, registrations

    // Mock deletion - replace with actual database delete
    console.log(`Deleting microsite: ${slug}`);

    return NextResponse.json({ message: 'Microsite deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting microsite:', error);
    return NextResponse.json({ error: 'Failed to delete microsite' }, { status: 500 });
  }
}
