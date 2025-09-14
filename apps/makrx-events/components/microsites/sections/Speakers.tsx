'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Calendar } from 'lucide-react';

interface Speaker {
  id: string;
  name: string;
  title: string;
  company?: string;
  bio: string;
  avatar?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  topics?: string[];
  sessions?: Array<{
    title: string;
    time: string;
    venue: string;
  }>;
}

interface SpeakersContent {
  title: string;
  description?: string;
  speakers: Speaker[];
}

interface SpeakersProps {
  id: string;
  content: SpeakersContent;
  variant?: string;
  micrositeSlug: string;
  theme?: {
    tokens: Record<string, string>;
    assets: Record<string, string>;
  };
}

export default function Speakers({ content, variant = 'grid', theme }: SpeakersProps) {
  const primaryColor = theme?.tokens?.primary || '#3B82F6';

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">{content.title}</h2>
          {content.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{content.description}</p>
          )}
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.speakers.map((speaker) => (
            <Card key={speaker.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                {/* Avatar */}
                <div className="text-center mb-4">
                  {speaker.avatar ? (
                    <img
                      src={speaker.avatar}
                      alt={speaker.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto bg-muted flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {speaker.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name and Title */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-foreground mb-1">{speaker.name}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{speaker.title}</p>
                  {speaker.company && (
                    <p className="text-sm text-muted-foreground">{speaker.company}</p>
                  )}
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{speaker.bio}</p>

                {/* Topics */}
                {speaker.topics && speaker.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {speaker.topics.slice(0, 3).map((topic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {speaker.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{speaker.topics.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Sessions */}
                {speaker.sessions && speaker.sessions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {speaker.sessions.map((session, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-3">
                        <h4 className="font-medium text-sm text-foreground mb-1">
                          {session.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {session.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.venue}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Social Links */}
                {speaker.social && (
                  <div className="flex justify-center gap-2">
                    {speaker.social.twitter && (
                      <a
                        href={speaker.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                        </svg>
                      </a>
                    )}
                    {speaker.social.linkedin && (
                      <a
                        href={speaker.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                      </a>
                    )}
                    {speaker.social.website && (
                      <a
                        href={speaker.social.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {content.speakers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-lg font-medium mb-2">Speakers Coming Soon</h3>
              <p className="text-sm">We're finalizing our amazing lineup. Check back soon!</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
