'use client';

import { Card, CardContent } from '@/components/ui/card';

interface Sponsor {
  name: string;
  logoUrl: string;
  url?: string;
  description?: string;
}

interface SponsorGroup {
  tier: string;
  logos: Sponsor[];
  description?: string;
}

interface SponsorsContent {
  title: string;
  description?: string;
  groups: SponsorGroup[];
}

interface SponsorsProps {
  id: string;
  content: SponsorsContent;
  variant?: string;
  micrositeSlug: string;
  theme?: {
    tokens: Record<string, string>;
    assets: Record<string, string>;
  };
}

export default function Sponsors({ content, variant = 'grid', theme }: SponsorsProps) {
  const primaryColor = theme?.tokens?.primary || '#3B82F6';

  const getTierStyle = (tier: string) => {
    const tierLower = tier.toLowerCase();
    if (tierLower.includes('title') || tierLower.includes('presenting')) {
      return {
        gridCols: 'grid-cols-1 md:grid-cols-2',
        logoSize: 'h-20 md:h-24',
        titleSize: 'text-2xl font-bold',
        titleColor: 'text-yellow-600'
      };
    } else if (tierLower.includes('gold') || tierLower.includes('platinum')) {
      return {
        gridCols: 'grid-cols-2 md:grid-cols-3',
        logoSize: 'h-16 md:h-20',
        titleSize: 'text-xl font-semibold',
        titleColor: 'text-yellow-600'
      };
    } else if (tierLower.includes('silver')) {
      return {
        gridCols: 'grid-cols-2 md:grid-cols-4',
        logoSize: 'h-12 md:h-16',
        titleSize: 'text-lg font-semibold',
        titleColor: 'text-gray-500'
      };
    } else {
      return {
        gridCols: 'grid-cols-3 md:grid-cols-6',
        logoSize: 'h-10 md:h-12',
        titleSize: 'text-base font-medium',
        titleColor: 'text-bronze-600'
      };
    }
  };

  const SponsorLogo = ({ sponsor }: { sponsor: Sponsor }) => {
    const logoElement = (
      <div className="group relative bg-white rounded-lg border border-border hover:border-primary/20 transition-all duration-200 hover:shadow-md p-4 flex items-center justify-center">
        <img
          src={sponsor.logoUrl}
          alt={`${sponsor.name} logo`}
          className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-200"
        />
        
        {/* Tooltip */}
        {sponsor.description && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            {sponsor.description}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    );

    return sponsor.url ? (
      <a 
        href={sponsor.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
        title={sponsor.name}
      >
        {logoElement}
      </a>
    ) : (
      logoElement
    );
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {content.title}
          </h2>
          {content.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {content.description}
            </p>
          )}
        </div>

        {/* Sponsor Groups */}
        <div className="space-y-16">
          {content.groups?.map((group, groupIndex) => {
            const tierStyle = getTierStyle(group.tier);
            
            return (
              <div key={groupIndex} className="space-y-8">
                {/* Tier Header */}
                <div className="text-center">
                  <h3 className={`${tierStyle.titleSize} ${tierStyle.titleColor} mb-2`}>
                    {group.tier} Sponsors
                  </h3>
                  {group.description && (
                    <p className="text-muted-foreground">
                      {group.description}
                    </p>
                  )}
                </div>

                {/* Sponsor Grid */}
                {group.logos.length > 0 ? (
                  <div className={`grid ${tierStyle.gridCols} gap-6 items-center`}>
                    {group.logos.map((sponsor, logoIndex) => (
                      <div key={logoIndex} className={tierStyle.logoSize}>
                        <SponsorLogo sponsor={sponsor} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <div className="text-muted-foreground">
                      <div className="text-4xl mb-4">🤝</div>
                      <h4 className="text-lg font-medium mb-2">
                        Become a {group.tier} Sponsor
                      </h4>
                      <p className="text-sm">
                        Support our community and get your brand in front of makers and innovators.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Interested in Sponsoring?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join these amazing companies in supporting our maker community. 
                Various sponsorship packages available to suit your needs.
              </p>
              <a
                href="mailto:sponsors@example.com"
                className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                Contact Us About Sponsorship
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}