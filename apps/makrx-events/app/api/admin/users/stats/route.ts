import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow static/mock data for static export safety
  return NextResponse.json({
    totalUsers: 1000,
    activeUsers: 900,
    eventAdmins: 10,
    pendingApplications: 2,
  });
}
