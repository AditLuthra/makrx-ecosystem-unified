import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow static/mock data for static export safety
  return NextResponse.json({
    id: 'mock-user-1',
    email: 'mockuser@example.com',
    keycloakId: 'mock-user-1',
    firstName: 'Mock',
    lastName: 'User',
    roles: ['super_admin'],
    profileImageUrl: null,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  });
}
