import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { insertPageSectionSchema, micrositeSections, microsites } from '@shared/schema';
import { and, eq } from 'drizzle-orm';

const findMicrosite = async (slug: string) => {
  const [record] = await db
    .select({ id: microsites.id })
    .from(microsites)
    .where(eq(microsites.slug, slug))
    .limit(1);
  return record;
};

const findSection = async (micrositeId: string, id: string) => {
  const [record] = await db
    .select()
    .from(micrositeSections)
    .where(and(eq(micrositeSections.id, id), eq(micrositeSections.micrositeId, micrositeId)))
    .limit(1);
  return record;
};

// GET /api/microsites/[slug]/sections/[id] - Get specific section
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } },
) {
  try {
    const { slug, id } = await params;
    const microsite = await findMicrosite(slug);

    if (!microsite) {
      return NextResponse.json({ error: 'Microsite not found' }, { status: 404 });
    }

    const section = await findSection(microsite.id, id);
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json({ error: 'Failed to fetch section' }, { status: 500 });
  }
}

// PATCH /api/microsites/[slug]/sections/[id] - Update section
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } },
) {
  try {
    const { slug, id } = await params;
    const microsite = await findMicrosite(slug);

    if (!microsite) {
      return NextResponse.json({ error: 'Microsite not found' }, { status: 404 });
    }

    const section = await findSection(microsite.id, id);
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = insertPageSectionSchema.partial().parse({ ...body, micrositeId: microsite.id });

    const [updated] = await db
      .update(micrositeSections)
      .set({
        type: parsed.type ?? section.type,
        order: parsed.order ?? section.order,
        isVisible: parsed.isVisible ?? section.isVisible,
        contentJson: parsed.contentJson ?? section.contentJson,
        updatedAt: new Date(),
      })
      .where(and(eq(micrositeSections.id, id), eq(micrositeSections.micrositeId, microsite.id)))
      .returning();

    return NextResponse.json(updated);
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

    console.error('Error updating section:', error);
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

// DELETE /api/microsites/[slug]/sections/[id] - Delete section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } },
) {
  try {
    const { slug, id } = await params;
    const microsite = await findMicrosite(slug);

    if (!microsite) {
      return NextResponse.json({ error: 'Microsite not found' }, { status: 404 });
    }

    const deleted = await db
      .delete(micrositeSections)
      .where(and(eq(micrositeSections.id, id), eq(micrositeSections.micrositeId, microsite.id)))
      .returning({ id: micrositeSections.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}
