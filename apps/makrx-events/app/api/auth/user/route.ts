import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    // Get user from request
    const user = (request as AuthenticatedRequest).user;

    if (!user) {
      return NextResponse.json({ error: 'No user session found' }, { status: 401 });
    }

    // Try to fetch user data from database, create if doesn't exist
    let [userData] = await db.select().from(users).where(eq(users.keycloakId, user.id)).limit(1);

    if (!userData) {
      // Create user in database if they don't exist
      [userData] = await db
        .insert(users)
        .values({
          keycloakId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: null,
          role: user.roles?.includes('super_admin')
            ? 'super_admin'
            : user.roles?.includes('event_admin')
              ? 'event_admin'
              : 'user',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
