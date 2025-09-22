import { db } from '@/lib/db';
import { isMockMode, safeDbCall } from '@/lib/runtime-guards';
import { InsertMicrosite, insertMicrositeSchema, microsites } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// GET /api/microsites/[slug] - Get microsite by slug
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  if (isMockMode()) {
    // Return mock microsite
    return NextResponse.json({
      id: 'mock-id',
      slug: params.slug,
      title: 'Mock Microsite',
      description: 'This is a mock microsite for development.',
      status: 'published',
    });
  }
  try {
    const { slug } = await params;
    const [microsite] = await safeDbCall(
      () => db.select().from(microsites).where(eq(microsites.slug, slug)).limit(1),
      [],
    );
    if (!microsite) {
      return NextResponse.json({ error: 'Microsite not found' }, { status: 404 });
    }
    return NextResponse.json(microsite);
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

    const updates = insertMicrositeSchema.partial().parse(body) as Partial<InsertMicrosite>;

    const [existing] = await db.select().from(microsites).where(eq(microsites.slug, slug)).limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Microsite not found' }, { status: 404 });
    }

    const [updated] = await db
      .update(microsites)
      .set({
        title: updates.title ?? existing.title,
        subtitle: updates.subtitle ?? existing.subtitle,
        description: updates.description ?? existing.description,
        status: updates.status ?? existing.status,
        visibility: updates.visibility ?? existing.visibility,
        hostType: updates.hostType ?? existing.hostType,
        hostRef: updates.hostRef ?? existing.hostRef,
        organizer: updates.organizer ?? existing.organizer,
        website: updates.website ?? existing.website,
        heroImage: updates.heroImage ?? existing.heroImage,
        location: updates.location ?? existing.location,
        startsAt: updates.startsAt ?? existing.startsAt,
        endsAt: updates.endsAt ?? existing.endsAt,
        templateId: updates.templateId ?? existing.templateId,
        themeId: updates.themeId ?? existing.themeId,
        highlights: updates.highlights ?? existing.highlights,
        settings: updates.settings ?? existing.settings,
        seo: updates.seo ?? existing.seo,
        updatedAt: new Date(),
      })
      .where(eq(microsites.id, existing.id))
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

    console.error('Error updating microsite:', error);
    return NextResponse.json({ error: 'Failed to update microsite' }, { status: 500 });
  }
}

// DELETE /api/microsites/[slug] - Delete microsite
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;

    const [existing] = await db
      .select({ id: microsites.id })
      .from(microsites)
      .where(eq(microsites.slug, slug))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Microsite not found' }, { status: 404 });
    }

    await db.delete(microsites).where(eq(microsites.id, existing.id));

    return NextResponse.json({ message: 'Microsite deleted successfully' });
  } catch (error) {
    console.error('Error deleting microsite:', error);
    return NextResponse.json({ error: 'Failed to delete microsite' }, { status: 500 });
  }
}
