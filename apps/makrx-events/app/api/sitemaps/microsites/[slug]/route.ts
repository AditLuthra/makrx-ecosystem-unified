import { isMockMode } from '@/lib/runtime-guards';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/sitemaps/microsites/[slug] - Generate sitemap for specific microsite
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://makrx.events';
  if (isMockMode() || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || process.env.NEXT_EXPORT) {
    // Return a static XML sitemap for static export/mock mode
    const staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/m/${params.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/m/${params.slug}/events</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    return new NextResponse(staticSitemap, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
  // Only import DB and schema after static/mock guard
  const { db } = await import('@/lib/db');
  const { microsites } = await import('@shared/schema');
  const { eq } = await import('drizzle-orm');
  try {
    const { slug } = params;
    const [microsite] = await db
      .select({
        id: microsites.id,
        updatedAt: microsites.updatedAt,
        createdAt: microsites.createdAt,
        slug: microsites.slug,
      })
      .from(microsites)
      .where(eq(microsites.slug, slug))
      .limit(1);

    if (!microsite) {
      return new NextResponse('Microsite not found', { status: 404 });
    }

    const fallbackDate = microsite.updatedAt ?? microsite.createdAt ?? new Date();
    const staticPages = ['about', 'schedule', 'speakers', 'sponsors', 'venue', 'faq', 'contact'];
    const urlEntries = [
      {
        loc: `${baseUrl}/m/${slug}`,
        lastmod: fallbackDate,
        changefreq: 'weekly',
        priority: '1.0',
      },
      ...staticPages.map((page) => ({
        loc: `${baseUrl}/m/${slug}/${page}`,
        lastmod: fallbackDate,
        changefreq: page === 'contact' ? 'monthly' : 'weekly',
        priority: page === 'contact' ? '0.6' : '0.8',
      })),
      {
        loc: `${baseUrl}/m/${slug}/events`,
        lastmod: fallbackDate,
        changefreq: 'daily',
        priority: '0.9',
      },
    ];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries
  .map(
    (entry) =>
      `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>`;
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Failed to generate sitemap', { status: 500 });
  }
}
