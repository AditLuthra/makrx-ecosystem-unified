import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, teamMembers, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string; teamId: string } }
) {
  try {
    const [team] = await db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.id, params.teamId),
          eq(teams.eventId, params.eventId)
        )
      )
      .limit(1);

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Get team members
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
      .where(eq(teamMembers.teamId, params.teamId));

    return NextResponse.json({
      ...team,
      members,
      memberCount: members.length,
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string; teamId: string } }
) {
  try {
    const body = await request.json();

    const [team] = await db
      .update(teams)
      .set({
        name: body.name,
        description: body.description,
        status: body.status,
        avatar: body.avatar,
      })
      .where(
        and(
          eq(teams.id, params.teamId),
          eq(teams.eventId, params.eventId)
        )
      )
      .returning();

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string; teamId: string } }
) {
  try {
    // Delete team members first
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.teamId, params.teamId));

    // Delete team
    const [team] = await db
      .delete(teams)
      .where(
        and(
          eq(teams.id, params.teamId),
          eq(teams.eventId, params.eventId)
        )
      )
      .returning();

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}