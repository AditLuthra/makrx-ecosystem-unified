import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Trophy, Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface MicrositeEventsPageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeEventsPage({ params }: MicrositeEventsPageProps) {
  const { micrositeSlug } = await params;
  
  // Mock data - in real app this would fetch from API
  const microsite = {
    title: "MakerFest 2024",
    slug: micrositeSlug
  };

  const events = [
    {
      slug: "robotics-championship",
      title: "Robotics Championship",
      description: "Build and program autonomous robots to compete in challenging tasks.",
      type: "competition",
      date: "March 16, 2024",
      time: "10:00 AM - 6:00 PM",
      location: "Main Arena",
      participants: 150,
      prize: "$10,000",
      difficulty: "Intermediate",
      track: "Robotics"
    },
    {
      slug: "3d-printing-workshop",
      title: "3D Printing Mastery Workshop",
      description: "Learn 3D modeling, printing techniques, and post-processing methods.",
      type: "workshop",
      date: "March 15, 2024",
      time: "2:00 PM - 5:00 PM",
      location: "Workshop Hall A",
      capacity: 50,
      price: "Included",
      level: "Beginner",
      track: "Manufacturing"
    },
    {
      slug: "iot-hackathon",
      title: "IoT Smart Cities Hackathon",
      description: "48-hour intensive hackathon for smart city IoT solutions.",
      type: "competition",
      date: "March 16-17, 2024",
      time: "48 hours",
      location: "Hackathon Zone",
      participants: 200,
      prize: "$15,000",
      difficulty: "Advanced",
      track: "IoT"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Microsite Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href={`/m/${micrositeSlug}`} className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {microsite.title}
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href={`/m/${micrositeSlug}/events`} className="text-primary font-medium">
                Events
              </Link>
              <Link href={`/m/${micrositeSlug}/schedule`} className="text-gray-700 hover:text-primary">
                Schedule
              </Link>
              <Link href={`/m/${micrositeSlug}/sponsors`} className="text-gray-700 hover:text-primary">
                Sponsors
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Events</h1>
          <p className="text-lg text-gray-600">
            Explore all competitions, workshops, and activities at {microsite.title}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button variant="outline" size="sm">All Events</Button>
          <Button variant="outline" size="sm">Competitions</Button>
          <Button variant="outline" size="sm">Workshops</Button>
          <Button variant="outline" size="sm">Robotics Track</Button>
          <Button variant="outline" size="sm">IoT Track</Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <Badge 
                    variant="secondary"
                    className={`${
                      event.type === 'competition' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {event.type === 'competition' ? (
                      <Trophy className="h-3 w-3 mr-1" />
                    ) : (
                      <Wrench className="h-3 w-3 mr-1" />
                    )}
                    {event.type}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location} • {event.time}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {event.participants || event.capacity} {event.participants ? 'participants' : 'capacity'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">{event.track}</Badge>
                  {event.difficulty && (
                    <Badge variant="outline" className="text-xs">{event.difficulty}</Badge>
                  )}
                  {event.level && (
                    <Badge variant="outline" className="text-xs">{event.level}</Badge>
                  )}
                </div>

                {event.prize && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <div className="text-sm font-semibold text-yellow-800">Prize: {event.prize}</div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/m/${micrositeSlug}/events/${event.slug}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link href={`/m/${micrositeSlug}/events/${event.slug}/register`}>
                      {event.type === 'competition' ? 'Compete' : 'Enroll'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}