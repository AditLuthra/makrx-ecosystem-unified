import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow static/mock data for static export safety
  return NextResponse.json([
    {
      id: 'mock-user-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'super_admin',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-06-01T00:00:00Z',
    },
  ]);
}
