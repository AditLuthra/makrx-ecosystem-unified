import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventRegistrations, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const participants = await db
      .select({
        id: eventRegistrations.id,
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
        registrationType: eventRegistrations.type,
        status: eventRegistrations.status,
        registeredAt: eventRegistrations.registeredAt,
      })
      .from(eventRegistrations)
      .leftJoin(users, eq(eventRegistrations.userId, users.id))
      .where(eq(eventRegistrations.eventId, params.eventId));

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}