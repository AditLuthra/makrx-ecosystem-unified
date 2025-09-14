import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, teamMembers, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { createTeamSchema } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        maxMembers: teams.maxMembers,
        captainId: teams.captainId,
        status: teams.status,
        inviteCode: teams.inviteCode,
        avatar: teams.avatar,
        createdAt: teams.createdAt,
      })
      .from(teams)
      .where(eq(teams.eventId, params.eventId));

    // Get members for each team
    const teamsWithMembers = await Promise.all(
      eventTeams.map(async (team) => {
        const members = await db
          .select({
            id: teamMembers.id,
            userId: teamMembers.userId,
            role: teamMembers.role,
            status: teamMembers.status,
            joinedAt: teamMembers.joinedAt,
            user: {
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              email: users.email,
              profileImageUrl: users.profileImageUrl,
            },
          })
          .from(teamMembers)
          .leftJoin(users, eq(teamMembers.userId, users.id))
          .where(eq(teamMembers.teamId, team.id));

        return {
          ...team,
          members,
          memberCount: members.length,
        };
      })
    );

    return NextResponse.json(teamsWithMembers);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
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
    const validatedData = createTeamSchema.parse({
      ...body,
      eventId: params.eventId,
    });

    const inviteCode = nanoid(8).toUpperCase();

    const [team] = await db
      .insert(teams)
      .values({
        eventId: params.eventId,
        name: validatedData.name,
        description: validatedData.description,
        maxMembers: validatedData.maxMembers,
        captainId: validatedData.captainId,
        inviteCode,
        status: 'forming',
      })
      .returning();

    // Add captain as first member
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: validatedData.captainId,
      role: 'captain',
      status: 'active',
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}