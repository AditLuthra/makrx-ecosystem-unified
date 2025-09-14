import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://makrx.events';

  // Mock microsites data - replace with actual database query
  const mockMicrosites = [
    {
      slug: 'makerfest-2024',
      updatedAt: '2024-02-01T10:00:00Z',
    },
    {
      slug: 'techcon-spring',
      updatedAt: '2024-02-01T12:00:00Z',
    },
    {
      slug: 'innovation-expo',
      updatedAt: '2024-02-01T14:00:00Z',
    },
  ];

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
  const micrositeRoutes = mockMicrosites.flatMap((microsite) => [
    {
      url: `${baseUrl}/m/${microsite.slug}`,
      lastModified: new Date(microsite.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/m/${microsite.slug}/events`,
      lastModified: new Date(microsite.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/m/${microsite.slug}/about`,
      lastModified: new Date(microsite.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ]);

  return [...staticRoutes, ...micrositeRoutes];
}
