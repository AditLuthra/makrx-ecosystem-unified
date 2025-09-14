import { NextRequest, NextResponse } from 'next/server';

// GET /api/templates - Get all available templates
export async function GET(request: NextRequest) {
  try {
    // Mock templates data based on specification
    const mockTemplates = [
      {
        id: 'festival-classic',
        name: 'Festival Classic',
        description:
          'Bold hero sections, track ribbons, and sponsor stripes. Perfect for maker festivals and technology events.',
        category: 'Events',
        preview: {
          thumbnail:
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
          features: [
            'Hero section with CTA buttons',
            'Track-based event organization',
            'Sponsor grid with tiers',
            'Schedule timeline view',
            'Registration integration',
          ],
        },
        defaultSections: [
          { type: 'hero', order: 1, required: true },
          { type: 'about', order: 2, required: false },
          { type: 'tracks', order: 3, required: false },
          { type: 'schedule', order: 4, required: false },
          { type: 'sponsors', order: 5, required: false },
          { type: 'faq', order: 6, required: false },
        ],
        allowedSections: [
          'hero',
          'about',
          'tracks',
          'schedule',
          'speakers',
          'sponsors',
          'venue',
          'faq',
          'custom-mdx',
        ],
        themeTokens: {
          colorScheme: 'vibrant',
          typography: 'modern',
          layout: 'full-width',
          components: 'bold',
        },
        settings: {
          enableTracks: true,
          enableSpeakers: true,
          enableSponsors: true,
          enableSchedule: true,
          headerStyle: 'full-hero',
          navigationStyle: 'sticky',
        },
        isActive: true,
        usageCount: 45,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'dark-tech',
        name: 'Dark Tech',
        description:
          'Neon accents, glass morphism UI, and card-based grids. Ideal for tech conferences and hackathons.',
        category: 'Technology',
        preview: {
          thumbnail:
            'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
          features: [
            'Dark theme with neon highlights',
            'Glass morphism effects',
            'Card-based layout system',
            'Animated interactions',
            'Tech-focused iconography',
          ],
        },
        defaultSections: [
          { type: 'hero', order: 1, required: true },
          { type: 'about', order: 2, required: false },
          { type: 'speakers', order: 3, required: false },
          { type: 'schedule', order: 4, required: false },
          { type: 'sponsors', order: 5, required: false },
        ],
        allowedSections: [
          'hero',
          'about',
          'speakers',
          'schedule',
          'sponsors',
          'venue',
          'faq',
          'custom-mdx',
        ],
        themeTokens: {
          colorScheme: 'dark',
          typography: 'futuristic',
          layout: 'cards',
          components: 'glassmorphism',
        },
        settings: {
          enableTracks: false,
          enableSpeakers: true,
          enableSponsors: true,
          enableSchedule: true,
          headerStyle: 'minimal-hero',
          navigationStyle: 'glass',
        },
        isActive: true,
        usageCount: 23,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'minimal-pro',
        name: 'Minimal Pro',
        description:
          'Editorial typography, high contrast design, and clean layouts. Perfect for professional conferences.',
        category: 'Professional',
        preview: {
          thumbnail:
            'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop',
          features: [
            'Clean minimal design',
            'Editorial typography',
            'High contrast elements',
            'Content-focused layout',
            'Professional appearance',
          ],
        },
        defaultSections: [
          { type: 'hero', order: 1, required: true },
          { type: 'about', order: 2, required: false },
          { type: 'speakers', order: 3, required: false },
          { type: 'schedule', order: 4, required: false },
          { type: 'venue', order: 5, required: false },
          { type: 'faq', order: 6, required: false },
        ],
        allowedSections: [
          'hero',
          'about',
          'speakers',
          'schedule',
          'venue',
          'faq',
          'sponsors',
          'custom-mdx',
        ],
        themeTokens: {
          colorScheme: 'minimal',
          typography: 'editorial',
          layout: 'centered',
          components: 'clean',
        },
        settings: {
          enableTracks: false,
          enableSpeakers: true,
          enableSponsors: false,
          enableSchedule: true,
          headerStyle: 'text-hero',
          navigationStyle: 'minimal',
        },
        isActive: true,
        usageCount: 31,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    // Sort by usage count (most popular first)
    const sortedTemplates = mockTemplates.sort((a, b) => b.usageCount - a.usageCount);

    return NextResponse.json({
      data: sortedTemplates,
      categories: ['Events', 'Technology', 'Professional'],
      count: sortedTemplates.length,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}
