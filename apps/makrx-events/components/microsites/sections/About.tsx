'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AboutContent {
  title: string;
  description: string;
  content: string;
  image?: string;
  video?: string;
  highlights?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  features?: string[];
  tags?: string[];
}

interface AboutProps {
  id: string;
  content: AboutContent;
  variant?: string;
  micrositeSlug: string;
  theme?: {
    tokens: Record<string, string>;
    assets: Record<string, string>;
  };
}

export default function About({ content, variant = 'default', theme }: AboutProps) {
  const primaryColor = theme?.tokens?.primary || '#3B82F6';

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4">{content.title}</h2>
              {content.description && (
                <p className="text-xl text-muted-foreground mb-6">{content.description}</p>
              )}
            </div>

            {/* Main content */}
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content.content }} />
            </div>

            {/* Features list */}
            {content.features && content.features.length > 0 && (
              <div className="space-y-3">
                {content.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Media Content */}
          <div className="space-y-6">
            {/* Main image or video */}
            {content.video ? (
              <div className="aspect-video rounded-lg overflow-hidden">
                <video controls className="w-full h-full object-cover" poster={content.image}>
                  <source src={content.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : content.image ? (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={content.image}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* Highlights */}
            {content.highlights && content.highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.highlights.map((highlight, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      {highlight.icon && (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                          <span className="text-2xl">{highlight.icon}</span>
                        </div>
                      )}
                      <h3 className="font-semibold text-foreground mb-2">{highlight.title}</h3>
                      <p className="text-sm text-muted-foreground">{highlight.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
