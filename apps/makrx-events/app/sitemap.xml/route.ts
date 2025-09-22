// This route always returns a static XML sitemap for static export safety.
// It never fails during build, and does not require DB or dynamic data.
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  // Static fallback sitemap
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://makrx.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://makrx.com/events</loc>
    <priority>0.8</priority>
  </url>
</urlset>`;
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
