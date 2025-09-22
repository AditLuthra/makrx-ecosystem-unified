import { NextResponse } from 'next/server';

export async function getUsersDynamic(request: any) {
  const { requireAuth } = await import('@/lib/auth-middleware');
  const { db } = await import('@/lib/db');
  const { users } = await import('@shared/schema');
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
    const allUsers = await safeDbCall(async () => {
      return await db
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
    }, []);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
