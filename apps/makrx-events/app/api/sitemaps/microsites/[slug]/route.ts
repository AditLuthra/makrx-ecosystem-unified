import { NextRequest, NextResponse } from 'next/server';

// GET /api/sitemaps/microsites/[slug] - Generate sitemap for specific microsite
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://makrx.events';

    // Mock microsite data - replace with actual database query
    const mockMicrosite = {
      slug,
      title: 'MakerFest 2024',
      updatedAt: '2024-02-01T10:00:00Z',
      subEvents: [
        {
          slug: 'autonomous-robot-competition',
          title: 'Autonomous Robot Competition',
          updatedAt: '2024-02-01T12:00:00Z'
        },
        {
          slug: 'iot-workshop',
          title: 'IoT Development Workshop',
          updatedAt: '2024-02-01T14:00:00Z'
        },
        {
          slug: 'ai-ethics-panel',
          title: 'AI Ethics Panel Discussion',
          updatedAt: '2024-02-01T16:00:00Z'
        }
      ],
      sections: [
        { slug: 'about', updatedAt: '2024-01-30T10:00:00Z' },
        { slug: 'schedule', updatedAt: '2024-01-31T10:00:00Z' },
        { slug: 'speakers', updatedAt: '2024-02-01T08:00:00Z' },
        { slug: 'sponsors', updatedAt: '2024-01-29T10:00:00Z' },
        { slug: 'venue', updatedAt: '2024-01-28T10:00:00Z' },
        { slug: 'faq', updatedAt: '2024-01-27T10:00:00Z' }
      ]
    };

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Microsite homepage -->
  <url>
    <loc>${baseUrl}/m/${slug}</loc>
    <lastmod>${mockMicrosite.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Microsite pages -->
  ${mockMicrosite.sections.map(section => `
  <url>
    <loc>${baseUrl}/m/${slug}/${section.slug}</loc>
    <lastmod>${section.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}

  <!-- Events listing page -->
  <url>
    <loc>${baseUrl}/m/${slug}/events</loc>
    <lastmod>${mockMicrosite.updatedAt}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Individual sub-events -->
  ${mockMicrosite.subEvents.map(event => `
  <url>
    <loc>${baseUrl}/m/${slug}/events/${event.slug}</loc>
    <lastmod>${event.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/m/${slug}/events/${event.slug}/register</loc>
    <lastmod>${event.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}

  <!-- Contact page -->
  <url>
    <loc>${baseUrl}/m/${slug}/contact</loc>
    <lastmod>${mockMicrosite.updatedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Failed to generate sitemap', { status: 500 });
  }
}