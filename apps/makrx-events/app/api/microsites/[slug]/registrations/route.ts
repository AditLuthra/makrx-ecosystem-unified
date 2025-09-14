import { NextRequest, NextResponse } from 'next/server';

// GET /api/microsites/[slug]/registrations - Get registrations with export options
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    const format = searchParams.get('format') || 'json'; // json, csv
    const status = searchParams.get('status'); // confirmed, pending, cancelled
    const eventSlug = searchParams.get('event');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Mock data - replace with actual database queries
    const mockRegistrations = [
      {
        id: 'reg_1',
        userId: 'user_123',
        micrositeId: '1',
        subEventId: '1',
        subEventSlug: 'autonomous-robot-competition',
        subEventTitle: 'Autonomous Robot Competition',
        ticketTierId: null,
        ticketTierName: null,
        quantity: 1,
        status: 'confirmed',
        paymentRef: null,
        qrCode: 'QR_ABC123',
        participantInfo: {
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1-555-0123',
          organization: 'Tech University'
        },
        teamInfo: {
          teamName: 'RoboWizards',
          teamMembers: [
            { name: 'John Smith', email: 'john.smith@example.com', role: 'Lead' },
            { name: 'Jane Doe', email: 'jane.doe@example.com', role: 'Developer' }
          ]
        },
        registeredAt: '2024-02-01T10:30:00Z',
        checkedInAt: null
      },
      {
        id: 'reg_2',
        userId: 'user_456',
        micrositeId: '1',
        subEventId: '2',
        subEventSlug: '3d-printing-mastery',
        subEventTitle: '3D Printing Mastery Workshop',
        ticketTierId: 'tier_2',
        ticketTierName: 'Regular',
        quantity: 1,
        status: 'confirmed',
        paymentRef: 'pay_xyz789',
        qrCode: 'QR_DEF456',
        participantInfo: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1-555-0456',
          organization: 'MakerSpace Co'
        },
        teamInfo: null,
        paidAmount: 100.00,
        currency: 'USD',
        registeredAt: '2024-02-02T14:15:00Z',
        checkedInAt: '2024-03-15T09:45:00Z'
      },
      {
        id: 'reg_3',
        userId: null,
        micrositeId: '1',
        subEventId: '3',
        subEventSlug: 'iot-sensors-workshop',
        subEventTitle: 'IoT Sensor Networks',
        ticketTierId: null,
        ticketTierName: null,
        quantity: 1,
        status: 'pending',
        paymentRef: null,
        qrCode: null,
        participantInfo: {
          name: 'Mike Chen',
          email: 'mike.chen@example.com',
          phone: null,
          organization: null
        },
        teamInfo: null,
        registeredAt: '2024-02-03T16:20:00Z',
        checkedInAt: null
      }
    ];

    // Apply filters
    let filteredRegistrations = mockRegistrations;
    
    if (status) {
      filteredRegistrations = filteredRegistrations.filter(r => r.status === status);
    }
    
    if (eventSlug) {
      filteredRegistrations = filteredRegistrations.filter(r => r.subEventSlug === eventSlug);
    }

    // Handle CSV export
    if (format === 'csv') {
      const csvHeaders = [
        'Registration ID',
        'Event',
        'Participant Name',
        'Email',
        'Phone',
        'Organization',
        'Team Name',
        'Ticket Tier',
        'Quantity',
        'Amount Paid',
        'Status',
        'Registered At',
        'Checked In At',
        'QR Code'
      ];

      const csvRows = filteredRegistrations.map(reg => [
        reg.id,
        reg.subEventTitle,
        reg.participantInfo.name,
        reg.participantInfo.email,
        reg.participantInfo.phone || '',
        reg.participantInfo.organization || '',
        reg.teamInfo?.teamName || '',
        reg.ticketTierName || 'Free',
        reg.quantity,
        reg.paidAmount || '0.00',
        reg.status,
        reg.registeredAt,
        reg.checkedInAt || '',
        reg.qrCode || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="registrations-${slug}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Pagination for JSON response
    const offset = (page - 1) * limit;
    const paginatedRegistrations = filteredRegistrations.slice(offset, offset + limit);

    const summary = {
      total: filteredRegistrations.length,
      confirmed: filteredRegistrations.filter(r => r.status === 'confirmed').length,
      pending: filteredRegistrations.filter(r => r.status === 'pending').length,
      cancelled: filteredRegistrations.filter(r => r.status === 'cancelled').length,
      checkedIn: filteredRegistrations.filter(r => r.checkedInAt).length,
      totalRevenue: filteredRegistrations
        .filter(r => r.paidAmount)
        .reduce((sum, r) => sum + (r.paidAmount || 0), 0)
    };

    return NextResponse.json({
      data: paginatedRegistrations,
      summary,
      pagination: {
        page,
        limit,
        total: filteredRegistrations.length,
        totalPages: Math.ceil(filteredRegistrations.length / limit)
      },
      filters: {
        statuses: ['confirmed', 'pending', 'cancelled', 'waitlisted'],
        events: [
          { slug: 'autonomous-robot-competition', title: 'Robot Competition' },
          { slug: '3d-printing-mastery', title: '3D Printing Mastery' },
          { slug: 'iot-sensors-workshop', title: 'IoT Workshop' }
        ]
      }
    });

  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}