import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exportJobs } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { createExportSchema } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const exports = await db
      .select()
      .from(exportJobs)
      .where(eq(exportJobs.eventId, params.eventId))
      .orderBy(desc(exportJobs.createdAt));

    return NextResponse.json(exports);
  } catch (error) {
    console.error('Error fetching exports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exports' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = createExportSchema.parse({
      ...body,
      eventId: params.eventId,
    });

    const [exportJob] = await db
      .insert(exportJobs)
      .values({
        eventId: params.eventId,
        type: validatedData.type,
        format: validatedData.format,
        filters: validatedData.filters,
        includeFields: validatedData.includeFields,
        status: 'queued',
      })
      .returning();

    // TODO: Queue background job for processing
    // This would involve creating a job queue system

    return NextResponse.json(exportJob, { status: 201 });
  } catch (error) {
    console.error('Error creating export:', error);
    return NextResponse.json(
      { error: 'Failed to create export' },
      { status: 500 }
    );
  }
}