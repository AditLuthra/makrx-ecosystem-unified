import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const reorderSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    }),
  ),
});

// PATCH /api/microsites/[slug]/sections/reorder - Reorder sections
export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = reorderSchema.parse(body);

    // Mock update - replace with actual database transaction
    const updatedSections = validatedData.sections.map((section) => ({
      id: section.id,
      order: section.order,
      updatedAt: new Date().toISOString(),
    }));

    // TODO: Update all sections in a single transaction
    console.log(`Reordering sections for microsite ${slug}:`, updatedSections);

    return NextResponse.json({
      message: 'Sections reordered successfully',
      data: updatedSections,
    });
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

    console.error('Error reordering sections:', error);
    return NextResponse.json({ error: 'Failed to reorder sections' }, { status: 500 });
  }
}
