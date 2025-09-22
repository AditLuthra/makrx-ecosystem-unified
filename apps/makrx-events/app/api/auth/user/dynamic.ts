import { NextResponse } from 'next/server';

export async function getUserDynamic(request: any) {
  const { requireAuth } = await import('@/lib/auth-middleware');
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }
    const user = (request as any).user;
    if (!user) {
      return NextResponse.json({ error: 'No user session found' }, { status: 401 });
    }
    // Only use available user fields, fill others with null or static values
    return NextResponse.json({
      id: user.id ?? null,
      email: user.email ?? null,
      keycloakId: user.id ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      roles: user.roles ?? [],
      profileImageUrl: null,
      status: null,
      createdAt: null,
      updatedAt: null,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
