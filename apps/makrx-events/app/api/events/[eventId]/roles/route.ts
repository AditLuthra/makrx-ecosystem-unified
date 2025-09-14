import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventRoles, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const roles = await db
      .select({
        id: eventRoles.id,
        userId: eventRoles.userId,
        role: eventRoles.role,
        permissions: eventRoles.permissions,
        assignedBy: eventRoles.assignedBy,
        assignedAt: eventRoles.assignedAt,
        isActive: eventRoles.isActive,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(eventRoles)
      .leftJoin(users, eq(eventRoles.userId, users.id))
      .where(eq(eventRoles.eventId, params.eventId));

    // Get assigner info for each role
    const rolesWithAssigners = await Promise.all(
      roles.map(async (role) => {
        if (role.assignedBy) {
          const [assigner] = await db
            .select({
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
            })
            .from(users)
            .where(eq(users.id, role.assignedBy))
            .limit(1);

          return {
            ...role,
            assigner,
          };
        }
        return role;
      }),
    );

    return NextResponse.json(rolesWithAssigners);
  } catch (error) {
    console.error('Error fetching event roles:', error);
    return NextResponse.json({ error: 'Failed to fetch event roles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const body = await request.json();

    // Check if role already exists for this user in this event
    const existingRole = await db
      .select()
      .from(eventRoles)
      .where(and(eq(eventRoles.eventId, params.eventId), eq(eventRoles.userId, body.userId)))
      .limit(1);

    if (existingRole.length > 0) {
      return NextResponse.json({ error: 'User already has a role in this event' }, { status: 400 });
    }

    const [role] = await db
      .insert(eventRoles)
      .values({
        eventId: params.eventId,
        userId: body.userId,
        role: body.role,
        permissions: body.permissions,
        assignedBy: body.assignedBy,
        isActive: true,
      })
      .returning();

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('Error creating event role:', error);
    return NextResponse.json({ error: 'Failed to create event role' }, { status: 500 });
  }
}
