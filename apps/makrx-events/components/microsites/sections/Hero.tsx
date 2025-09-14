'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  ctaButtons: Array<{
    text: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline';
  }>;
  badges?: Array<{
    text: string;
    variant: 'default' | 'secondary' | 'destructive';
  }>;
  stats?: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
  dates?: {
    start: string;
    end: string;
  };
  venue?: {
    name: string;
    address: string;
  };
}

interface HeroProps {
  id: string;
  content: HeroContent;
  variant?: string;
  micrositeSlug: string;
  theme?: {
    tokens: Record<string, string>;
    assets: Record<string, string>;
  };
}

export default function Hero({ content, variant = 'default', micrositeSlug, theme }: HeroProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDateRange = () => {
    if (!content.dates) return null;
    const start = formatDate(content.dates.start);
    const end = formatDate(content.dates.end);
    return start === end ? start : `${start} - ${end}`;
  };

  const heroBackground = content.backgroundImage || theme?.assets?.heroUrl;
  const primaryColor = theme?.tokens?.primary || '#3B82F6';

  return (
    <section className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {content.backgroundVideo ? (
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={content.backgroundVideo} type="video/mp4" />
          </video>
        ) : heroBackground ? (
          <img src={heroBackground} alt="Hero background" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${theme?.tokens?.accent || '#8B5CF6'})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badges */}
          {content.badges && content.badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {content.badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant as any}>
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {content.title}
          </h1>

          {/* Subtitle */}
          {content.subtitle && (
            <p className="text-xl md:text-2xl text-white/90 mb-6 font-medium">{content.subtitle}</p>
          )}

          {/* Description */}
          {content.description && (
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">{content.description}</p>
          )}

          {/* Event Info */}
          {(content.dates || content.venue) && (
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-white/90">
              {content.dates && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">{getDateRange()}</span>
                </div>
              )}
              {content.venue && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">{content.venue.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          {content.stats && content.stats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {content.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          {content.ctaButtons && content.ctaButtons.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {content.ctaButtons.map((button, index) => {
                const isExternal = button.href.startsWith('http');
                const href = isExternal ? button.href : `/m/${micrositeSlug}${button.href}`;

                const buttonVariants = {
                  primary: 'default',
                  secondary: 'secondary',
                  outline: 'outline',
                };

                const ButtonComponent = (
                  <Button
                    variant={buttonVariants[button.variant] as any}
                    size="lg"
                    className={`${button.variant === 'primary' ? `bg-[${primaryColor}] hover:bg-[${primaryColor}]/90` : ''}`}
                  >
                    {button.text}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                );

                return isExternal ? (
                  <a key={index} href={href} target="_blank" rel="noopener noreferrer">
                    {ButtonComponent}
                  </a>
                ) : (
                  <Link key={index} href={href}>
                    {ButtonComponent}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
}
