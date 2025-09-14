'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  type: 'competition' | 'workshop' | 'talk' | 'break' | 'ceremony';
  startTime: string;
  endTime: string;
  venue?: string;
  speakers?: Array<{
    name: string;
    title: string;
    avatar?: string;
  }>;
  capacity?: number;
  registered?: number;
  isRegistrationOpen?: boolean;
  subEventSlug?: string;
  track?: string;
}

interface ScheduleDay {
  date: string;
  items: ScheduleItem[];
}

interface ScheduleContent {
  title: string;
  description?: string;
  days: ScheduleDay[];
  timezone?: string;
}

interface ScheduleProps {
  id: string;
  content: ScheduleContent;
  variant?: string;
  micrositeSlug: string;
  theme?: {
    tokens: Record<string, string>;
    assets: Record<string, string>;
  };
}

export default function Schedule({
  content,
  variant = 'default',
  micrositeSlug,
  theme,
}: ScheduleProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const primaryColor = theme?.tokens?.primary || '#3B82F6';

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      competition: 'bg-red-100 text-red-800',
      workshop: 'bg-blue-100 text-blue-800',
      talk: 'bg-green-100 text-green-800',
      break: 'bg-gray-100 text-gray-800',
      ceremony: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      competition: '🏆',
      workshop: '🔧',
      talk: '💡',
      break: '☕',
      ceremony: '🎉',
    };
    return icons[type as keyof typeof icons] || '📅';
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">{content.title}</h2>
          {content.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{content.description}</p>
          )}
          {content.timezone && (
            <p className="text-sm text-muted-foreground mt-2">All times in {content.timezone}</p>
          )}
        </div>

        {/* Day Selector */}
        {content.days && content.days.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {content.days.map((day, index) => (
              <Button
                key={index}
                variant={selectedDay === index ? 'default' : 'outline'}
                onClick={() => setSelectedDay(index)}
                className="min-w-32"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(day.date)}
              </Button>
            ))}
          </div>
        )}

        {/* Schedule Timeline */}
        <div className="space-y-4">
          {content.days?.[selectedDay]?.items?.map((item, index) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Time */}
                  <div className="flex-shrink-0 text-center lg:text-left">
                    <div className="text-lg font-bold text-foreground">
                      {formatTime(item.startTime)}
                    </div>
                    <div className="text-sm text-muted-foreground">{formatTime(item.endTime)}</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={getTypeColor(item.type)}>
                        {getTypeIcon(item.type)} {item.type}
                      </Badge>
                      {item.track && <Badge variant="outline">{item.track}</Badge>}
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>

                    <p className="text-muted-foreground mb-3">{item.description}</p>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {item.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {item.venue}
                        </div>
                      )}

                      {item.capacity && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {item.registered || 0}/{item.capacity}
                        </div>
                      )}

                      {item.speakers && item.speakers.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span>by</span>
                          <div className="flex items-center gap-2">
                            {item.speakers.map((speaker, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                {speaker.avatar && (
                                  <img
                                    src={speaker.avatar}
                                    alt={speaker.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                )}
                                <span className="font-medium">{speaker.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    {item.subEventSlug && item.isRegistrationOpen && (
                      <Link href={`/m/${micrositeSlug}/events/${item.subEventSlug}`}>
                        <Button size="sm">
                          View Details
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {content.days?.[selectedDay]?.items?.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No events scheduled</h3>
            <p className="text-muted-foreground">Check back later for updates to the schedule.</p>
          </div>
        )}
      </div>
    </section>
  );
}
