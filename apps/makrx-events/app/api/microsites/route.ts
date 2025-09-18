import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { microsites, insertMicrositeSchema, InsertMicrosite } from '@shared/schema';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// GET /api/microsites - List all microsites (with pagination and filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50);
    const status = searchParams.get('status');
    const hostType = searchParams.get('hostType');
    const visibility = searchParams.get('visibility');
    const search = searchParams.get('search');

    const filters = [];
    if (status) filters.push(eq(microsites.status, status));
    if (hostType) filters.push(eq(microsites.hostType, hostType));
    if (visibility) filters.push(eq(microsites.visibility, visibility));
    if (search) {
      const searchTerm = `%${search}%`;
      filters.push(
        or(
          ilike(microsites.title, searchTerm),
          ilike(microsites.subtitle, searchTerm),
          ilike(microsites.description, searchTerm),
        ),
      );
    }

    const whereClause = filters.length ? and(...filters) : undefined;

    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(microsites);
    if (whereClause) {
      totalQuery.where(whereClause);
    }
    const [{ count: total = 0 } = { count: 0 }] = await totalQuery;

    const offset = (page - 1) * limit;
    const listQuery = db
      .select()
      .from(microsites)
      .orderBy(desc(microsites.createdAt))
      .limit(limit)
      .offset(offset);
    if (whereClause) {
      listQuery.where(whereClause);
    }
    const data = await listQuery;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching microsites:', error);
    return NextResponse.json({ error: 'Failed to fetch microsites' }, { status: 500 });
  }
}

// POST /api/microsites - Create a new microsite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = insertMicrositeSchema.partial().parse(body) as InsertMicrosite;

    if (!parsed.title) {
      return NextResponse.json(
        { error: 'Title is required to create a microsite.' },
        { status: 400 },
      );
    }

    const slug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.title);

    const existing = await db
      .select({ id: microsites.id })
      .from(microsites)
      .where(eq(microsites.slug, slug))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'A microsite with this slug already exists.' },
        { status: 409 },
      );
    }

    const now = new Date();
    const [created] = await db
      .insert(microsites)
      .values({
        slug,
        title: parsed.title,
        subtitle: parsed.subtitle ?? null,
        description: parsed.description ?? null,
        status: parsed.status ?? 'draft',
        visibility: parsed.visibility ?? 'private',
        hostType: parsed.hostType ?? null,
        hostRef: parsed.hostRef ?? null,
        organizer: parsed.organizer ?? null,
        website: parsed.website ?? null,
        heroImage: parsed.heroImage ?? null,
        location: parsed.location ?? null,
        startsAt: parsed.startsAt ?? null,
        endsAt: parsed.endsAt ?? null,
        templateId: parsed.templateId ?? null,
        themeId: parsed.themeId ?? null,
        highlights: parsed.highlights ?? null,
        settings: parsed.settings ?? null,
        seo: parsed.seo ?? null,
        createdAt: now,
        updatedAt: now,
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

    console.error('Error creating microsite:', error);
    return NextResponse.json({ error: 'Failed to create microsite' }, { status: 500 });
  }
}
