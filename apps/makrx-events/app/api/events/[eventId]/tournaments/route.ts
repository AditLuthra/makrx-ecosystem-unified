import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tournaments, activities } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventTournaments = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        description: tournaments.description,
        format: tournaments.format,
        status: tournaments.status,
        maxParticipants: tournaments.maxParticipants,
        currentRound: tournaments.currentRound,
        createdAt: tournaments.createdAt,
        startedAt: tournaments.startedAt,
        completedAt: tournaments.completedAt,
        activity: {
          id: activities.id,
          title: activities.title,
          type: activities.type,
        }
      })
      .from(tournaments)
      .leftJoin(activities, eq(tournaments.activityId, activities.id))
      .where(eq(tournaments.eventId, params.eventId))
      .orderBy(tournaments.createdAt);

    return NextResponse.json(eventTournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { name, description, format, activityId, maxParticipants } = await request.json();

    const [tournament] = await db
      .insert(tournaments)
      .values({
        eventId: params.eventId,
        activityId,
        name,
        description,
        format,
        maxParticipants,
        status: 'setup',
      })
      .returning();

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 });
  }
}