import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  CheckCircle,
  DollarSign,
  MapPin,
  Trophy,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EventPageProps {
  params: {
    eventId: string;
  };
}

// Event type definitions
type BaseEvent = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  fullDescription: string;
  type: 'festival' | 'competition' | 'workshop';
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  address?: string;
  attendees: number;
  price?: string;
  organizer: string;
  image: string;
  tags?: string[];
  features?: string[];
  schedule?: any[];
};
type FestivalEvent = BaseEvent & {
  type: 'festival';
  features: string[];
  subEvents?: Array<{
    title: string;
    description: string;
    type: string;
    prize?: string;
    duration?: string;
  }>;
  schedule: Array<{ day: string; events: string[] }>;
};
type CompetitionEvent = BaseEvent & {
  type: 'competition';
  features: string[];
  requirements?: string[];
  schedule: Array<{ time: string; event: string }>;
};
type WorkshopEvent = BaseEvent & {
  type: 'workshop';
  features: string[];
  includes?: string[];
  topics?: string[];
  instructor?: {
    name: string;
    bio: string;
    credentials: string;
  };
  schedule: Array<{ time?: string; event?: string }>;
};
type EventType = FestivalEvent | CompetitionEvent | WorkshopEvent;

// Mock event data - in a real app this would come from an API
const getEventData = (eventId: string): EventType | null => {
  const events: Record<string, EventType> = {
    'maker-fest-2024': {
      id: 'maker-fest-2024',
      title: 'Maker Fest 2024',
      subtitle: 'The Ultimate Maker Experience',
      description:
        'Join thousands of makers, inventors, and technology enthusiasts for the largest maker festival on the West Coast. Experience hands-on workshops, competitive challenges, product exhibitions, and networking opportunities that will inspire your next creation.',
      fullDescription:
        'Maker Fest 2024 brings together the global maker community for three days of innovation, creativity, and collaboration. From seasoned engineers to curious beginners, this festival offers something for everyone interested in the intersection of technology, art, and craftsmanship.',
      type: 'festival',
      date: 'March 15-17, 2024',
      startTime: '9:00 AM',
      endTime: '6:00 PM',
      location: 'Moscone Center, San Francisco, CA',
      address: '747 Howard St, San Francisco, CA 94103',
      attendees: 2500,
      price: 'Free',
      organizer: 'Bay Area Makers Guild',
      image:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      tags: ['Festival', 'Community', 'Technology'],
      features: [
        '50+ Interactive Workshops',
        'Maker Marketplace with 100+ Vendors',
        'Live Demonstrations',
        'Networking Sessions',
        'Keynote Speakers',
      ],
      subEvents: [
        {
          title: 'Robotics Championship',
          description: 'Build and compete with autonomous robots',
          type: 'competition',
          prize: '$10,000',
        },
        {
          title: 'IoT Hackathon',
          description: '48-hour smart city solutions challenge',
          type: 'competition',
          prize: '$15,000',
        },
        {
          title: '3D Printing Workshop',
          description: 'Learn modeling and printing techniques',
          type: 'workshop',
          duration: '3 hours',
        },
        {
          title: 'Arduino Basics',
          description: 'Electronics and programming fundamentals',
          type: 'workshop',
          duration: '2 hours',
        },
      ],
      schedule: [
        {
          day: 'Day 1',
          events: [
            'Opening Ceremony',
            'Keynote: Future of Making',
            'Workshop Sessions',
            'Networking Mixer',
          ],
        },
        {
          day: 'Day 2',
          events: ['Competition Kickoff', 'Maker Marketplace', 'Live Demos', 'Panel Discussions'],
        },
        {
          day: 'Day 3',
          events: [
            'Final Presentations',
            'Awards Ceremony',
            'Community Showcase',
            'Closing Reception',
          ],
        },
      ],

      // removed invalid workshop-style schedule from festival event
    },
    'robotics-championship': {
      id: 'robotics-championship',
      title: 'Robotics Championship 2024',
      subtitle: 'Build. Program. Compete.',
      description:
        'The premier robotics competition where teams design, build, and program autonomous robots to compete in challenging tasks. Open to students, professionals, and maker enthusiasts.',
      fullDescription:
        'Test your engineering and programming skills in this intense robotics competition. Teams have limited time and resources to build robots that can navigate obstacles, manipulate objects, and complete complex tasks autonomously.',
      type: 'competition',
      date: 'April 20, 2024',
      startTime: '8:00 AM',
      endTime: '8:00 PM',
      location: 'MIT Campus, Boston, MA',
      address: '77 Massachusetts Ave, Cambridge, MA 02139',
      attendees: 150,
      price: '$200/team',
      organizer: 'Northeast Robotics Alliance',
      image:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      tags: ['Robotics', 'Competition', 'Programming'],
      features: [
        '$10,000 Prize Pool',
        'Professional Judging Panel',
        'Live Streaming',
        'Networking Opportunities',
        'Industry Sponsorships',
      ],
      requirements: [
        'Teams of 3-5 members',
        'Robot must be autonomous',
        'Maximum size: 18x18x18 inches',
        'Weight limit: 25 pounds',
        'Programming in Python or C++',
      ],
      schedule: [
        { time: '8:00 AM', event: 'Registration & Robot Inspection' },
        { time: '10:00 AM', event: 'Opening Ceremony & Rules Brief' },
        { time: '11:00 AM', event: 'Qualification Rounds (Round 1)' },
        { time: '2:00 PM', event: 'Qualification Rounds (Round 2)' },
        { time: '4:00 PM', event: 'Semi-Finals' },
        { time: '6:00 PM', event: 'Finals & Awards Ceremony' },
      ],
    },
    '3d-printing-workshop': {
      id: '3d-printing-workshop',
      title: '3D Printing Mastery Workshop',
      subtitle: 'From Design to Print',
      description:
        'Comprehensive hands-on workshop covering the complete 3D printing workflow. Learn 3D modeling, printing techniques, material selection, and post-processing methods.',
      fullDescription:
        "Master the art and science of 3D printing in this intensive workshop. Whether you're a complete beginner or looking to enhance your skills, you'll learn industry best practices and hands-on techniques from experienced instructors.",
      type: 'workshop',
      date: 'May 5, 2024',
      startTime: '9:00 AM',
      endTime: '3:00 PM',
      location: 'Austin Maker Space, Austin, TX',
      address: '3701 E 5th St, Austin, TX 78702',
      attendees: 50,
      price: '$120',
      organizer: 'Austin Maker Collective',
      image:
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      tags: ['3D Printing', 'CAD', 'Workshop'],
      features: [
        'Hands-on Practice',
        'Take-home 3D Prints',
        'Industry Software Access',
        'Expert Instruction',
        'Small Group Setting',
      ],
      includes: [
        'All materials and filaments',
        'Fusion 360 software license',
        'Printed models to take home',
        'Digital resources and guides',
        'Lunch and refreshments',
      ],
      topics: [
        '3D Design Fundamentals',
        'CAD Software (Fusion 360)',
        'Print Settings & Optimization',
        'Material Properties',
        'Post-Processing Techniques',
        'Troubleshooting Common Issues',
      ],
      instructor: {
        name: 'Sarah Chen',
        bio: 'Industrial designer with 8+ years in additive manufacturing',
        credentials: 'Certified Fusion 360 Instructor, Former SpaceX Engineer',
      },
      schedule: [
        { time: '9:00 AM', event: 'Welcome & Introduction' },
        { time: '9:30 AM', event: '3D Design Fundamentals' },
        { time: '10:30 AM', event: 'CAD Software (Fusion 360)' },
        { time: '11:30 AM', event: 'Print Settings & Optimization' },
        { time: '12:30 PM', event: 'Lunch Break' },
        { time: '1:00 PM', event: 'Material Properties' },
        { time: '2:00 PM', event: 'Post-Processing Techniques' },
        { time: '3:00 PM', event: 'Q&A and Wrap-up' },
      ],
    },
  };

  return events[eventId as keyof typeof events] || null;
};

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = params;
  const event = getEventData(eventId);

  if (!event) {
    notFound();
    return null;
  }

  const isCompetition = event.type === 'competition';
  const isWorkshop = event.type === 'workshop';
  const isFestival = event.type === 'festival';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <Badge
              className={`mb-4 ${
                isFestival ? 'bg-purple-600' : isCompetition ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{event.title}</h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-6">{event.subtitle}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {event.date}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location}
              </div>
              {event.price && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {event.price}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>
                  About This {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <p className="text-gray-600">{event.fullDescription}</p>
              </CardContent>
            </Card>

            {/* Features/Topics */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isWorkshop
                    ? "What You'll Learn"
                    : isFestival
                      ? 'Event Highlights'
                      : 'Competition Features'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(isWorkshop && event.topics ? event.topics : event.features)?.map(
                    (item: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sub-events for festivals */}
            {isFestival && Array.isArray((event as FestivalEvent).subEvents) && (
              <Card>
                <CardHeader>
                  <CardTitle>Featured Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(event as FestivalEvent).subEvents!.map((subEvent: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          {subEvent.type === 'competition' ? (
                            <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                          ) : (
                            <Wrench className="h-4 w-4 text-blue-500 mr-2" />
                          )}
                          <h4 className="font-semibold">{subEvent.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{subEvent.description}</p>
                        {subEvent.prize && (
                          <Badge variant="secondary" className="text-xs">
                            Prize: {subEvent.prize}
                          </Badge>
                        )}
                        {subEvent.duration && (
                          <Badge variant="outline" className="text-xs">
                            {subEvent.duration}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements for competitions */}
            {isCompetition && Array.isArray((event as CompetitionEvent).requirements) && (
              <Card>
                <CardHeader>
                  <CardTitle>Competition Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(event as CompetitionEvent).requirements!.map((req: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Instructor for workshops */}
            {isWorkshop && (event as WorkshopEvent).instructor && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">
                        {(event as WorkshopEvent).instructor!.name}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">
                        {(event as WorkshopEvent).instructor!.bio}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(event as WorkshopEvent).instructor!.credentials}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">{event.date}</div>
                      {event.startTime && event.endTime && (
                        <div className="text-gray-500">
                          {event.startTime} - {event.endTime}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">{event.location}</div>
                      {event.address && <div className="text-gray-500">{event.address}</div>}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{event.attendees} attendees</span>
                  </div>
                  {event.price && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="font-semibold">{event.price}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Organized by {event.organizer}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button asChild className="w-full">
                    <Link href={`/events/${event.id}/register`}>
                      {isCompetition
                        ? 'Enter Competition'
                        : isWorkshop
                          ? 'Enroll Now'
                          : 'Register for Event'}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    Share Event
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            {Array.isArray(event.schedule) && event.schedule.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isFestival
                      ? '3-Day Schedule'
                      : isCompetition
                        ? 'Competition Schedule'
                        : 'Workshop Agenda'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.schedule.map((item: any, index: number) => (
                      <div key={index} className="text-sm">
                        <div className="font-semibold text-gray-900">
                          {'day' in item ? item.day : item.time}
                        </div>
                        {'events' in item ? (
                          <ul className="text-gray-600 mt-1 space-y-1">
                            {Array.isArray(item.events) &&
                              item.events.map((evt: string, i: number) => <li key={i}>• {evt}</li>)}
                          </ul>
                        ) : (
                          <div className="text-gray-600">{item.event}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What's Included for workshops */}
            {isWorkshop && Array.isArray((event as WorkshopEvent).includes) && (
              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(event as WorkshopEvent).includes!.map((item: string, index: number) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
