'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Clock } from 'lucide-react';
import Link from 'next/link';

interface Track {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  events: Array<{
    id: string;
    title: string;
    type: 'competition' | 'workshop' | 'talk';
    duration: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    slug: string;
  }>;
  totalParticipants?: number;
  featured?: boolean;
}

interface TracksContent {
  title: string;
  description?: string;
  tracks: Track[];
}

interface TracksProps {
  id: string;
  content: TracksContent;
  variant?: string;
  micrositeSlug: string;
  theme?: {
    tokens: Record<string, string>;
    assets: Record<string, string>;
  };
}

export default function Tracks({ content, variant = 'grid', micrositeSlug, theme }: TracksProps) {
  const primaryColor = theme?.tokens?.primary || '#3B82F6';

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      competition: '🏆',
      workshop: '🔧',
      talk: '💡'
    };
    return icons[type as keyof typeof icons] || '📅';
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

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.tracks.map((track) => (
            <Card 
              key={track.id} 
              className={`group hover:shadow-lg transition-all duration-200 ${
                track.featured ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
            >
              {track.featured && (
                <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 text-center">
                  Featured Track
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  {track.icon && (
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ 
                        backgroundColor: track.color ? `${track.color}20` : `${primaryColor}20`,
                        color: track.color || primaryColor
                      }}
                    >
                      {track.icon}
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-xl">{track.name}</CardTitle>
                    {track.totalParticipants && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Users className="h-4 w-4" />
                        {track.totalParticipants} participants
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-muted-foreground">
                  {track.description}
                </p>
              </CardHeader>

              <CardContent>
                {/* Events List */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-medium text-sm text-foreground">
                    Events in this track:
                  </h4>
                  
                  {track.events.slice(0, 3).map((event) => (
                    <Link
                      key={event.id}
                      href={`/m/${micrositeSlug}/events/${event.slug}`}
                      className="block group/event"
                    >
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm">{getTypeIcon(event.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover/event:text-primary transition-colors">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${getDifficultyColor(event.difficulty)}`}>
                                {event.difficulty}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {event.duration}
                              </div>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/event:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                  
                  {track.events.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{track.events.length - 3} more events
                    </p>
                  )}
                </div>

                {/* View All Button */}
                <Link href={`/m/${micrositeSlug}/events?track=${encodeURIComponent(track.name)}`}>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
                  >
                    View All Events
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {content.tracks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <div className="text-4xl mb-4">🛤️</div>
              <h3 className="text-lg font-medium mb-2">
                Tracks Coming Soon
              </h3>
              <p className="text-sm">
                We're organizing events into tracks. Check back soon!
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}