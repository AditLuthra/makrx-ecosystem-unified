'use client';

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load section components for better performance
const Hero = lazy(() => import('./sections/Hero'));
const About = lazy(() => import('./sections/About'));
const Schedule = lazy(() => import('./sections/Schedule'));
const Sponsors = lazy(() => import('./sections/Sponsors'));
const FAQ = lazy(() => import('./sections/FAQ'));
const Tracks = lazy(() => import('./sections/Tracks'));
const Speakers = lazy(() => import('./sections/Speakers'));
const Venue = lazy(() => import('./sections/Venue'));
const CustomMDX = lazy(() => import('./sections/CustomMDX'));

interface PageSection {
  id: string;
  type: string;
  order: number;
  contentJson: any;
  variant?: string;
  isVisible?: boolean;
}

interface SectionRendererProps {
  sections: PageSection[];
  micrositeSlug: string;
  theme?: {
    tokens: Record<string, string>;
    assets: Record<string, string>;
  };
}

// Component registry - maps section types to their components
const SECTION_COMPONENTS = {
  hero: Hero,
  about: About,
  schedule: Schedule,
  sponsors: Sponsors,
  faq: FAQ,
  tracks: Tracks,
  speakers: Speakers,
  venue: Venue,
  'custom-mdx': CustomMDX
} as const;

// Loading skeleton for each section type
const SectionSkeleton = ({ type }: { type: string }) => {
  switch (type) {
    case 'hero':
      return (
        <div className="h-96 bg-muted rounded-lg animate-pulse">
          <div className="h-full flex flex-col justify-center items-center space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      );
    case 'schedule':
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-12 w-20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'sponsors':
      return (
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      );
  }
};

export default function SectionRenderer({ sections, micrositeSlug, theme }: SectionRendererProps) {
  // Filter and sort sections
  const visibleSections = sections
    .filter(section => section.isVisible !== false)
    .sort((a, b) => a.order - b.order);

  const renderSection = (section: PageSection) => {
    const SectionComponent = SECTION_COMPONENTS[section.type as keyof typeof SECTION_COMPONENTS];
    
    if (!SectionComponent) {
      console.warn(`Unknown section type: ${section.type}`);
      return null;
    }

    return (
      <Suspense 
        key={section.id} 
        fallback={<SectionSkeleton type={section.type} />}
      >
        <SectionComponent
          id={section.id}
          content={section.contentJson}
          variant={section.variant}
          micrositeSlug={micrositeSlug}
          theme={theme}
        />
      </Suspense>
    );
  };

  return (
    <div className="space-y-12">
      {visibleSections.map(renderSection)}
    </div>
  );
}