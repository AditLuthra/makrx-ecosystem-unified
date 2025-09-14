import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@shared/schema';
import { requireAuth } from '@/lib/auth-middleware';
import { AuthenticatedRequest } from '@/lib/auth-middleware';
import { eq, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Require authentication and check for admin role
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    const user = (request as AuthenticatedRequest).user;
    
    // Check if user has admin privileges
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('event_admin')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get all users for super admins, or limited view for event admins
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}