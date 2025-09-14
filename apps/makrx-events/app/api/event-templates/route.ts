import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventTemplates, users } from '@shared/schema';
import { eq, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');

    let conditions = [];
    
    if (category) {
      conditions.push(eq(eventTemplates.category, category));
    }

    // Show public templates or user's own templates
    if (userId) {
      conditions.push(or(
        eq(eventTemplates.isPublic, true),
        eq(eventTemplates.createdBy, userId)
      ));
    } else {
      conditions.push(eq(eventTemplates.isPublic, true));
    }

    const templates = await db
      .select({
        id: eventTemplates.id,
        name: eventTemplates.name,
        description: eventTemplates.description,
        category: eventTemplates.category,
        isPublic: eventTemplates.isPublic,
        usageCount: eventTemplates.usageCount,
        tags: eventTemplates.tags,
        createdAt: eventTemplates.createdAt,
        creator: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(eventTemplates)
      .leftJoin(users, eq(eventTemplates.createdBy, users.id))
      .where(conditions.length > 0 ? conditions.reduce((a, b) => a && b) : undefined);

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching event templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const [template] = await db
      .insert(eventTemplates)
      .values({
        name: body.name,
        description: body.description,
        category: body.category,
        templateData: body.templateData,
        isPublic: body.isPublic ?? false,
        tags: body.tags,
        createdBy: body.userId,
      })
      .returning();

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating event template:', error);
    return NextResponse.json(
      { error: 'Failed to create event template' },
      { status: 500 }
    );
  }
}