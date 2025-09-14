import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventRegistrations, teamMembers, teams } from '@shared/schema';
import { eq, count, and } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    // Get total registered participants
    const [totalRegistrations] = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, params.eventId));

    // Get confirmed registrations
    const [confirmedRegistrations] = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, params.eventId),
          eq(eventRegistrations.status, 'confirmed'),
        ),
      );

    // Get team participants
    const [teamCount] = await db
      .select({ count: count() })
      .from(teams)
      .where(eq(teams.eventId, params.eventId));

    const [teamMemberCount] = await db
      .select({ count: count() })
      .from(teamMembers)
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teams.eventId, params.eventId));

    const audienceStats = {
      totalRegistrations: totalRegistrations.count,
      confirmedRegistrations: confirmedRegistrations.count,
      pendingRegistrations: totalRegistrations.count - confirmedRegistrations.count,
      teamCount: teamCount.count,
      teamMemberCount: teamMemberCount.count,
      individualParticipants: confirmedRegistrations.count - teamMemberCount.count,
      audiences: {
        all: totalRegistrations.count,
        registered: confirmedRegistrations.count,
        teams: teamMemberCount.count,
        individual: confirmedRegistrations.count - teamMemberCount.count,
      },
    };

    return NextResponse.json(audienceStats);
  } catch (error) {
    console.error('Error fetching audience stats:', error);
    return NextResponse.json({ error: 'Failed to fetch audience stats' }, { status: 500 });
  }
}
