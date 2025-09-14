import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MicrositeSchedulePageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeSchedulePage({ params }: MicrositeSchedulePageProps) {
  const { micrositeSlug } = await params;

  const microsite = {
    title: 'MakerFest 2024',
    slug: micrositeSlug,
  };

  const schedule = {
    'March 15, 2024': [
      {
        time: '9:00 AM',
        title: 'Registration & Welcome',
        location: 'Main Lobby',
        type: 'general',
      },
      {
        time: '10:00 AM',
        title: 'Opening Keynote',
        location: 'Main Auditorium',
        type: 'keynote',
        speaker: 'Dr. Jane Smith',
      },
      {
        time: '2:00 PM',
        title: '3D Printing Workshop',
        location: 'Workshop Hall A',
        type: 'workshop',
      },
      {
        time: '6:00 PM',
        title: 'Welcome Mixer',
        location: 'Exhibition Hall',
        type: 'social',
      },
    ],
    'March 16, 2024': [
      {
        time: '9:00 AM',
        title: 'Coffee & Networking',
        location: 'Main Lobby',
        type: 'social',
      },
      {
        time: '10:00 AM',
        title: 'Robotics Championship Begins',
        location: 'Main Arena',
        type: 'competition',
      },
      {
        time: '10:00 AM',
        title: 'IoT Hackathon Kickoff',
        location: 'Hackathon Zone',
        type: 'competition',
      },
      {
        time: '12:00 PM',
        title: 'Lunch Break',
        location: 'Food Court',
        type: 'break',
      },
      {
        time: '2:00 PM',
        title: 'Arduino Workshop',
        location: 'Workshop Hall B',
        type: 'workshop',
      },
    ],
    'March 17, 2024': [
      {
        time: '10:00 AM',
        title: 'Final Presentations',
        location: 'Main Auditorium',
        type: 'presentation',
      },
      {
        time: '2:00 PM',
        title: 'Awards Ceremony',
        location: 'Main Auditorium',
        type: 'ceremony',
      },
      {
        time: '4:00 PM',
        title: 'Closing Reception',
        location: 'Exhibition Hall',
        type: 'social',
      },
    ],
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      keynote: 'bg-purple-100 text-purple-800',
      workshop: 'bg-green-100 text-green-800',
      competition: 'bg-red-100 text-red-800',
      social: 'bg-blue-100 text-blue-800',
      presentation: 'bg-orange-100 text-orange-800',
      ceremony: 'bg-yellow-100 text-yellow-800',
      break: 'bg-gray-100 text-gray-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Microsite Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href={`/m/${micrositeSlug}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {microsite.title}
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <Link
                href={`/m/${micrositeSlug}/events`}
                className="text-gray-700 hover:text-primary"
              >
                Events
              </Link>
              <Link href={`/m/${micrositeSlug}/schedule`} className="text-primary font-medium">
                Schedule
              </Link>
              <Link
                href={`/m/${micrositeSlug}/sponsors`}
                className="text-gray-700 hover:text-primary"
              >
                Sponsors
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Schedule</h1>
          <p className="text-lg text-gray-600">
            Complete schedule for all {microsite.title} activities
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(schedule).map(([date, events]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Calendar className="h-6 w-6 mr-3" />
                  {date}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0 w-20 text-sm font-medium text-gray-900">
                        {event.time}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <Badge variant="secondary" className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                          {event.speaker && (
                            <div className="flex items-center">
                              <span>Speaker: {event.speaker}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Keynote
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Workshop
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Competition
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Social
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Presentation
              </Badge>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Ceremony
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
