import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventCheckIns, eventRegistrations, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const checkIns = await db
      .select({
        id: eventCheckIns.id,
        userId: eventCheckIns.userId,
        checkedInAt: eventCheckIns.checkedInAt,
        notes: eventCheckIns.notes,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        checkedInBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        }
      })
      .from(eventCheckIns)
      .leftJoin(users, eq(eventCheckIns.userId, users.id))
      .where(eq(eventCheckIns.eventId, params.eventId))
      .orderBy(eventCheckIns.checkedInAt);

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId, checkedInBy, notes } = await request.json();

    // Verify user is registered for the event
    const registration = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, params.eventId),
          eq(eventRegistrations.userId, userId)
        )
      )
      .limit(1);

    if (!registration.length) {
      return NextResponse.json({ error: 'User not registered for this event' }, { status: 400 });
    }

    // Check if already checked in
    const existingCheckIn = await db
      .select()
      .from(eventCheckIns)
      .where(
        and(
          eq(eventCheckIns.eventId, params.eventId),
          eq(eventCheckIns.userId, userId)
        )
      )
      .limit(1);

    if (existingCheckIn.length) {
      return NextResponse.json({ error: 'User already checked in' }, { status: 400 });
    }

    const [checkIn] = await db
      .insert(eventCheckIns)
      .values({
        eventId: params.eventId,
        userId,
        checkedInBy,
        notes,
      })
      .returning();

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json({ error: 'Failed to check in participant' }, { status: 500 });
  }
}