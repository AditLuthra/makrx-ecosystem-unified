import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insertThemeSchema } from '@shared/schema';

// GET /api/themes/[id] - Get specific theme
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Mock theme data - replace with actual database query
    const mockTheme = {
      id,
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
        // CSS custom properties
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      assets: {
        logoUrl: null,
        heroUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        faviconUrl: null,
        brandColor: '#3B82F6'
      },
      preview: {
        thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop',
        description: 'Bold and vibrant festival theme with blue primary colors'
      },
      cssVariables: {
        '--color-primary': '#3B82F6',
        '--color-accent': '#8B5CF6',
        '--color-background': '#FFFFFF',
        '--color-foreground': '#1F2937',
        '--color-muted': '#F3F4F6',
        '--color-muted-foreground': '#6B7280',
        '--color-border': '#E5E7EB',
        '--radius': '0.5rem',
        '--font-heading': 'Inter, sans-serif',
        '--font-body': 'Inter, sans-serif'
      },
      isActive: true,
      usageCount: 12, // How many microsites use this theme
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-01T14:30:00Z'
    };

    return NextResponse.json(mockTheme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    );
  }
}

// PATCH /api/themes/[id] - Update theme
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Partial validation
    const partialSchema = insertThemeSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Generate CSS variables from tokens
    const generateCSSVariables = (tokens: any) => {
      const cssVars: Record<string, string> = {};
      
      if (tokens.primary) cssVars['--color-primary'] = tokens.primary;
      if (tokens.accent) cssVars['--color-accent'] = tokens.accent;
      if (tokens.background) cssVars['--color-background'] = tokens.background;
      if (tokens.foreground) cssVars['--color-foreground'] = tokens.foreground;
      if (tokens.muted) cssVars['--color-muted'] = tokens.muted;
      if (tokens.mutedForeground) cssVars['--color-muted-foreground'] = tokens.mutedForeground;
      if (tokens.border) cssVars['--color-border'] = tokens.border;
      if (tokens.radius) cssVars['--radius'] = tokens.radius;
      if (tokens.fontHeading) cssVars['--font-heading'] = `${tokens.fontHeading}, sans-serif`;
      if (tokens.fontBody) cssVars['--font-body'] = `${tokens.fontBody}, sans-serif`;
      
      return cssVars;
    };

    // Mock update - replace with actual database update
    const updatedTheme = {
      id,
      name: validatedData.name || 'Festival Classic - Blue',
      templateId: validatedData.templateId || 'festival-classic',
      type: validatedData.type || 'custom',
      tokens: validatedData.tokens || {},
      assets: validatedData.assets || {},
      cssVariables: generateCSSVariables(validatedData.tokens || {}),
      preview: {
        thumbnail: validatedData.assets?.heroUrl || null,
        description: validatedData.description || ''
      },
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedTheme);
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

    console.error('Error updating theme:', error);
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}

// DELETE /api/themes/[id] - Delete custom theme
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // TODO: Check if theme is being used by any microsites
    // TODO: Only allow deletion of custom themes, not predefined ones

    // Mock deletion - replace with actual database delete
    console.log(`Deleting theme: ${id}`);

    return NextResponse.json(
      { message: 'Theme deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting theme:', error);
    return NextResponse.json(
      { error: 'Failed to delete theme' },
      { status: 500 }
    );
  }
}
