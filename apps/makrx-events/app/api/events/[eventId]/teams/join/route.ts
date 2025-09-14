import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, teamMembers } from '@shared/schema';
import { eq, and, count } from 'drizzle-orm';
import { joinTeamSchema } from '@/lib/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = joinTeamSchema.parse(body);

    // Find team by invite code
    const [team] = await db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.eventId, params.eventId),
          eq(teams.inviteCode, validatedData.inviteCode)
        )
      )
      .limit(1);

    if (!team) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    if (team.status !== 'forming') {
      return NextResponse.json(
        { error: 'Team is not accepting new members' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, team.id),
          eq(teamMembers.userId, validatedData.userId)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      );
    }

    // Check if team is full
    const [memberCount] = await db
      .select({ count: count() })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, team.id));

    if (memberCount.count >= team.maxMembers) {
      return NextResponse.json(
        { error: 'Team is full' },
        { status: 400 }
      );
    }

    // Add member to team
    const [member] = await db
      .insert(teamMembers)
      .values({
        teamId: team.id,
        userId: validatedData.userId,
        role: 'member',
        status: 'active',
      })
      .returning();

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json(
      { error: 'Failed to join team' },
      { status: 500 }
    );
  }
}