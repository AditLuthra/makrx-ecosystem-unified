import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sponsors } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allSponsors = await db
      .select()
      .from(sponsors)
      .where(eq(sponsors.status, 'active'))
      .orderBy(sponsors.name);

    return NextResponse.json(allSponsors);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sponsorData = await request.json();

    const [sponsor] = await db.insert(sponsors).values(sponsorData).returning();

    return NextResponse.json(sponsor, { status: 201 });
  } catch (error) {
    console.error('Error creating sponsor:', error);
    return NextResponse.json({ error: 'Failed to create sponsor' }, { status: 500 });
  }
}
