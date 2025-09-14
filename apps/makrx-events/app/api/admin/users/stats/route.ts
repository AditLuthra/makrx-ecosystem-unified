import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, adminApplications } from '@shared/schema';
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

    // Get user statistics
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users);

    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, 'active'));

    const [eventAdminsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'event_admin'));

    const [pendingApplicationsResult] = await db
      .select({ count: count() })
      .from(adminApplications)
      .where(eq(adminApplications.status, 'pending'));

    const stats = {
      totalUsers: totalUsersResult?.count || 0,
      activeUsers: activeUsersResult?.count || 0,
      eventAdmins: eventAdminsResult?.count || 0,
      pendingApplications: pendingApplicationsResult?.count || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}