import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertPageSectionSchema } from '@shared/schema';

// GET /api/microsites/[slug]/sections/[id] - Get specific section
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { slug, id } = await params;

    // Mock data - replace with actual database query
    const mockSection = {
      id,
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
        ctaUrl: `/m/${slug}/register`
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-01T15:30:00Z'
    };

    return NextResponse.json(mockSection);
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section' },
      { status: 500 }
    );
  }
}

// PATCH /api/microsites/[slug]/sections/[id] - Update section
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { slug, id } = await params;
    const body = await request.json();

    // Partial validation
    const partialSchema = insertPageSectionSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Mock update - replace with actual database update
    const updatedSection = {
      id,
      micrositeId: '1',
      type: validatedData.type || 'hero',
      order: validatedData.order || 1,
      isVisible: validatedData.isVisible ?? true,
      contentJson: validatedData.contentJson || {},
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedSection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE /api/microsites/[slug]/sections/[id] - Delete section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { slug, id } = await params;

    // Mock deletion - replace with actual database delete
    console.log(`Deleting section ${id} from microsite ${slug}`);

    return NextResponse.json(
      { message: 'Section deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}
