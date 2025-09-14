import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertThemeSchema } from '@shared/schema';

// GET /api/themes - Get all available themes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const type = searchParams.get('type'); // predefined, custom

    // Mock themes data - replace with actual database query
    const mockThemes = [
      {
        id: 'theme_festival_classic_blue',
        name: 'Festival Classic - Blue',
        templateId: 'festival-classic',
        type: 'predefined',
        tokens: {
          primary: '#3B82F6',
          accent: '#8B5CF6',
          background: '#FFFFFF',
          foreground: '#1F2937',
          muted: '#F3F4F6',
          mutedForeground: '#6B7280',
          border: '#E5E7EB',
          radius: '0.5rem',
          fontHeading: 'Inter',
          fontBody: 'Inter',
        },
        assets: {
          logoUrl: null,
          heroUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          faviconUrl: null,
        },
        preview: {
          thumbnail:
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop',
          description: 'Bold and vibrant festival theme with blue primary colors',
        },
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'theme_festival_classic_purple',
        name: 'Festival Classic - Purple',
        templateId: 'festival-classic',
        type: 'predefined',
        tokens: {
          primary: '#8B5CF6',
          accent: '#F59E0B',
          background: '#FFFFFF',
          foreground: '#1F2937',
          muted: '#F3F4F6',
          mutedForeground: '#6B7280',
          border: '#E5E7EB',
          radius: '0.5rem',
          fontHeading: 'Inter',
          fontBody: 'Inter',
        },
        assets: {
          logoUrl: null,
          heroUrl: 'https://images.unsplash.com/photo-1551818255-e6e10975cd86',
          faviconUrl: null,
        },
        preview: {
          thumbnail:
            'https://images.unsplash.com/photo-1551818255-e6e10975cd86?w=300&h=200&fit=crop',
          description: 'Creative purple theme perfect for tech and innovation events',
        },
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'theme_dark_tech',
        name: 'Dark Tech - Neon',
        templateId: 'dark-tech',
        type: 'predefined',
        tokens: {
          primary: '#00E5FF',
          accent: '#FF6B35',
          background: '#0A0A0B',
          foreground: '#FFFFFF',
          muted: '#1A1A1B',
          mutedForeground: '#A3A3A3',
          border: '#262626',
          radius: '0.75rem',
          fontHeading: 'Orbitron',
          fontBody: 'Inter',
        },
        assets: {
          logoUrl: null,
          heroUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
          faviconUrl: null,
        },
        preview: {
          thumbnail:
            'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop',
          description: 'Futuristic dark theme with neon accents and glass morphism',
        },
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'theme_minimal_pro',
        name: 'Minimal Pro - Clean',
        templateId: 'minimal-pro',
        type: 'predefined',
        tokens: {
          primary: '#000000',
          accent: '#EF4444',
          background: '#FAFAFA',
          foreground: '#0A0A0A',
          muted: '#F5F5F5',
          mutedForeground: '#737373',
          border: '#E4E4E7',
          radius: '0.25rem',
          fontHeading: 'Playfair Display',
          fontBody: 'Source Sans Pro',
        },
        assets: {
          logoUrl: null,
          heroUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc',
          faviconUrl: null,
        },
        preview: {
          thumbnail:
            'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=300&h=200&fit=crop',
          description: 'Clean minimal design with high contrast and editorial typography',
        },
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
      },
    ];

    // Apply filters
    let filteredThemes = mockThemes;

    if (templateId) {
      filteredThemes = filteredThemes.filter((t) => t.templateId === templateId);
    }

    if (type) {
      filteredThemes = filteredThemes.filter((t) => t.type === type);
    }

    // Group by template for easier selection
    const themesByTemplate = filteredThemes.reduce(
      (acc, theme) => {
        if (!acc[theme.templateId]) {
          acc[theme.templateId] = [];
        }
        acc[theme.templateId].push(theme);
        return acc;
      },
      {} as Record<string, typeof mockThemes>,
    );

    return NextResponse.json({
      data: filteredThemes,
      byTemplate: themesByTemplate,
      count: filteredThemes.length,
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

// POST /api/themes - Create a custom theme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = insertThemeSchema.parse(body);

    // Mock creation - replace with actual database insert
    const newTheme = {
      id: `theme_${Date.now()}`,
      name: validatedData.name,
      templateId: validatedData.templateId,
      type: 'custom',
      tokens: validatedData.tokens || {},
      assets: validatedData.assets || {},
      preview: {
        thumbnail: validatedData.assets?.heroUrl || null,
        description: validatedData.description || '',
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(newTheme, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 },
      );
    }

    console.error('Error creating theme:', error);
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
  }
}
