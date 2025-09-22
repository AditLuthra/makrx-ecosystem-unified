import { NextResponse } from 'next/server';

export async function getUserStatsDynamic(request: any) {
  const { requireAuth } = await import('@/lib/auth-middleware');
  const { db } = await import('@/lib/db');
  const { users, adminApplications } = await import('@shared/schema');
  const { count, eq } = await import('drizzle-orm');
  const { safeDbCall } = await import('@/lib/runtime-guards');
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }
    const user = (request as any).user;
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('event_admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    const stats = await safeDbCall(
      async () => {
        const [totalUsersResult] = await db.select({ count: count() }).from(users);
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
        return {
          totalUsers: totalUsersResult?.count || 0,
          activeUsers: activeUsersResult?.count || 0,
          eventAdmins: eventAdminsResult?.count || 0,
          pendingApplications: pendingApplicationsResult?.count || 0,
        };
      },
      {
        totalUsers: 0,
        activeUsers: 0,
        eventAdmins: 0,
        pendingApplications: 0,
      },
    );
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}
