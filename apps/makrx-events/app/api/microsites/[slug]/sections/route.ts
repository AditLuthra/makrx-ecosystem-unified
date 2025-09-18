import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  insertPageSectionSchema,
  micrositeSections,
  microsites,
  InsertMicrositeSection,
} from '@shared/schema';
import { asc, eq, sql } from 'drizzle-orm';

const ensureMicrosite = async (slug: string) => {
  const [record] = await db
    .select({ id: microsites.id })
    .from(microsites)
    .where(eq(microsites.slug, slug))
    .limit(1);
  return record;
};

// GET /api/microsites/[slug]/sections - Get all sections for a microsite
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const microsite = await ensureMicrosite(slug);

    if (!microsite) {
      return NextResponse.json({ error: 'Microsite not found' }, { status: 404 });
    }

    const sections = await db
      .select()
      .from(micrositeSections)
      .where(eq(micrositeSections.micrositeId, microsite.id))
      .orderBy(asc(micrositeSections.order), asc(micrositeSections.createdAt));

    return NextResponse.json({
      data: sections,
      count: sections.length,
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
    const microsite = await ensureMicrosite(slug);

    if (!microsite) {
      return NextResponse.json({ error: 'Microsite not found' }, { status: 404 });
    }

    const body = await request.json();
    const payload = { ...body, micrositeId: microsite.id };
    const parsed = insertPageSectionSchema.parse(payload) as InsertMicrositeSection;

    let orderValue = parsed.order;
    if (orderValue == null) {
      const [maxOrder] = await db
        .select({ value: sql<number>`COALESCE(MAX("order"), 0)` })
        .from(micrositeSections)
        .where(eq(micrositeSections.micrositeId, microsite.id));
      orderValue = (maxOrder?.value ?? 0) + 1;
    }

    const [created] = await db
      .insert(micrositeSections)
      .values({
        micrositeId: microsite.id,
        type: parsed.type,
        order: orderValue,
        isVisible: parsed.isVisible ?? true,
        contentJson: parsed.contentJson ?? {},
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
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
