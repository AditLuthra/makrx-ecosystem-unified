import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const checkInSchema = z.object({
  qrCode: z.string().optional(),
  staffId: z.string().min(1),
  notes: z.string().optional(),
  location: z.string().optional(),
});

// POST /api/registrations/[id]/check-in - Check in a participant
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = checkInSchema.parse(body);

    // Mock registration lookup - replace with actual database query
    const mockRegistration = {
      id,
      userId: 'user_123',
      micrositeId: '1',
      subEventId: '1',
      subEventSlug: 'autonomous-robot-competition',
      subEventTitle: 'Autonomous Robot Competition',
      status: 'confirmed',
      qrCode: 'QR_ABC123',
      participantInfo: {
        name: 'John Smith',
        email: 'john.smith@example.com',
      },
      checkedInAt: null,
    };

    if (!mockRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (mockRegistration.status !== 'confirmed') {
      return NextResponse.json({ error: 'Registration is not confirmed' }, { status: 400 });
    }

    if (mockRegistration.checkedInAt) {
      return NextResponse.json({
        message: 'Participant already checked in',
        registration: mockRegistration,
        checkedInAt: mockRegistration.checkedInAt,
      });
    }

    // Verify QR code if provided
    if (validatedData.qrCode && validatedData.qrCode !== mockRegistration.qrCode) {
      return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 });
    }

    // Mock check-in update - replace with actual database update
    const checkedInRegistration = {
      ...mockRegistration,
      checkedInAt: new Date().toISOString(),
      checkInDetails: {
        staffId: validatedData.staffId,
        notes: validatedData.notes,
        location: validatedData.location,
        method: validatedData.qrCode ? 'qr_scan' : 'manual',
      },
    };

    // TODO: Log check-in event for analytics
    // TODO: Update event attendance count
    // TODO: Send welcome notification if configured

    return NextResponse.json({
      message: 'Check-in successful',
      registration: checkedInRegistration,
      participant: {
        name: mockRegistration.participantInfo.name,
        email: mockRegistration.participantInfo.email,
      },
      event: {
        title: mockRegistration.subEventTitle,
        slug: mockRegistration.subEventSlug,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error('Error processing check-in:', error);
    return NextResponse.json({ error: 'Failed to process check-in' }, { status: 500 });
  }
}

// GET /api/registrations/[id]/check-in - Get check-in status
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // Mock registration lookup - replace with actual database query
    const mockRegistration = {
      id,
      participantInfo: {
        name: 'John Smith',
        email: 'john.smith@example.com',
      },
      subEventTitle: 'Autonomous Robot Competition',
      status: 'confirmed',
      checkedInAt: '2024-03-15T09:45:00Z',
      checkInDetails: {
        staffId: 'staff_456',
        staffName: 'Alice Johnson',
        location: 'Main Entrance',
        method: 'qr_scan',
      },
    };

    if (!mockRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({
      registration: mockRegistration,
      isCheckedIn: !!mockRegistration.checkedInAt,
    });
  } catch (error) {
    console.error('Error fetching check-in status:', error);
    return NextResponse.json({ error: 'Failed to fetch check-in status' }, { status: 500 });
  }
}
