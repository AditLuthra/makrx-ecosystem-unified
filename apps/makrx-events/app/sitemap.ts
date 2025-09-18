import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { microsites } from '@shared/schema';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://makrx.events';

  const micrositeRecords = await db
    .select({ slug: microsites.slug, updatedAt: microsites.updatedAt })
    .from(microsites);

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Add microsite routes
  const micrositeRoutes = micrositeRecords.flatMap((microsite) => [
    {
      url: `${baseUrl}/m/${microsite.slug}`,
      lastModified: microsite.updatedAt ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/m/${microsite.slug}/events`,
      lastModified: microsite.updatedAt ?? new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/m/${microsite.slug}/about`,
      lastModified: microsite.updatedAt ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ]);

  return [...staticRoutes, ...micrositeRoutes];
}
