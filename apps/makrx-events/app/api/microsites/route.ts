import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertMicrositeSchema } from '@shared/schema';

// GET /api/microsites - List all microsites (with pagination and filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const hostType = searchParams.get('hostType');
    const search = searchParams.get('search');

    // Mock data - replace with actual database query
    const mockMicrosites = [
      {
        id: '1',
        slug: 'makerfest-2024',
        title: 'MakerFest 2024',
        subtitle: 'The Ultimate Maker Experience',
        description: 'Join thousands of makers for the largest maker festival.',
        status: 'published',
        hostType: 'MakrCave',
        startsAt: '2024-03-15T09:00:00Z',
        endsAt: '2024-03-17T18:00:00Z',
        templateId: 'festival-classic',
        themeId: 'blue-theme',
        visibility: 'public',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-01T15:30:00Z'
      }
    ];

    // Apply filters
    let filteredMicrosites = mockMicrosites;
    
    if (status) {
      filteredMicrosites = filteredMicrosites.filter(m => m.status === status);
    }
    
    if (hostType) {
      filteredMicrosites = filteredMicrosites.filter(m => m.hostType === hostType);
    }
    
    if (search) {
      filteredMicrosites = filteredMicrosites.filter(m => 
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const offset = (page - 1) * limit;
    const paginatedMicrosites = filteredMicrosites.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedMicrosites,
      pagination: {
        page,
        limit,
        total: filteredMicrosites.length,
        totalPages: Math.ceil(filteredMicrosites.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching microsites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch microsites' },
      { status: 500 }
    );
  }
}

// POST /api/microsites - Create a new microsite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = insertMicrositeSchema.parse(body);
    
    // Generate slug from title if not provided
    if (!validatedData.slug) {
      validatedData.slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Mock creation - replace with actual database insert
    const newMicrosite = {
      id: `ms_${Date.now()}`,
      ...validatedData,
      status: 'draft',
      visibility: validatedData.visibility || 'public',
      templateId: validatedData.templateId || 'festival-classic',
      themeId: validatedData.themeId || 'default-theme',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Check for slug uniqueness
    // TODO: Create default sections for the microsite
    // TODO: Apply default theme and template settings

    return NextResponse.json(newMicrosite, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Error creating microsite:', error);
    return NextResponse.json(
      { error: 'Failed to create microsite' },
      { status: 500 }
    );
  }
}
