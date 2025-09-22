import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow static/mock data for static export safety
  return NextResponse.json([
    {
      id: 'mock-reg-1',
      type: 'workshop',
      status: 'confirmed',
      registeredAt: '2024-06-01T10:00:00Z',
      event: {
        id: 'mock-event-1',
        title: 'Mock Hackathon',
        startDate: '2024-07-01T09:00:00Z',
        endDate: '2024-07-01T18:00:00Z',
        location: 'Online',
        featuredImage: null,
      },
    },
  ]);
}
