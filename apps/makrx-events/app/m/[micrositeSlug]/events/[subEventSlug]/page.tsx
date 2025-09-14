import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  DollarSign,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

interface EventPageProps {
  params: {
    micrositeSlug: string;
    subEventSlug: string;
  };
}

// Mock data - replace with actual database queries
async function getEventData(micrositeSlug: string, eventSlug: string) {
  // TODO: Replace with actual database query
  const mockEvent = {
    id: 'event_1',
    slug: eventSlug,
    title: 'Autonomous Robot Competition',
    shortDesc: 'Build and program robots to navigate complex challenges autonomously.',
    longDesc: `
      <p>Join us for the most exciting robotics competition of the year! Teams will design, build, and program autonomous robots capable of navigating complex obstacle courses, completing specific tasks, and demonstrating innovative problem-solving approaches.</p>
      
      <h3>What You'll Learn:</h3>
      <ul>
        <li>Advanced robotics programming techniques</li>
        <li>Sensor integration and data processing</li>
        <li>Path planning and navigation algorithms</li>
        <li>Team collaboration and project management</li>
      </ul>
      
      <h3>Competition Format:</h3>
      <p>The competition consists of three rounds: qualification, semifinals, and finals. Each team will have multiple attempts to complete the course, with the best time determining advancement.</p>
    `,
    rulesMd: `
      # Competition Rules
      
      ## Team Requirements
      - Teams of 2-4 members
      - At least one team member must be present during competition
      - Teams must build their own robot (no pre-built commercial robots)
      
      ## Robot Specifications
      - Maximum dimensions: 30cm x 30cm x 30cm
      - Weight limit: 5kg
      - Must be fully autonomous (no remote control)
      - All components must be visible for inspection
      
      ## Competition Rules
      1. **Safety First**: All robots must pass safety inspection
      2. **Fair Play**: No interference with other teams' robots
      3. **Time Limits**: 5 minutes maximum per run
      4. **Appeals**: Any disputes must be raised immediately with judges
      
      ## Scoring
      - Base points for completing objectives
      - Bonus points for speed and innovation
      - Deductions for penalties or rule violations
    `,
    prizesMd: `
      # Prizes & Recognition
      
      ## Cash Prizes
      - **1st Place**: $5,000 + Trophy
      - **2nd Place**: $3,000 + Trophy  
      - **3rd Place**: $2,000 + Trophy
      
      ## Special Awards
      - **Most Innovative Design**: $1,000
      - **Best Newcomer Team**: $500
      - **People's Choice Award**: $500
      
      ## Additional Benefits
      - Winner interviews with tech media
      - Mentorship opportunities with industry experts
      - Priority access to future competitions
      - Certificate of achievement for all participants
    `,
    type: 'competition',
    track: 'Robotics & AI',
    startsAt: '2024-04-15T17:30:00Z',
    endsAt: '2024-04-15T21:30:00Z',
    venue: 'Competition Arena A',
    venueDetails: {
      address: 'Building A, Level 2, MakerSpace Convention Center',
      capacity: 500,
      facilities: ['WiFi', 'Power Outlets', 'Tool Library', 'Safety Equipment'],
    },
    capacity: 100,
    registeredCount: 85,
    waitlistCount: 15,
    registrationType: 'free',
    isRegistrationOpen: true,
    difficulty: 'intermediate',
    tags: ['Robotics', 'Programming', 'Competition', 'Autonomous Systems'],
    featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
    images: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12',
      'https://images.unsplash.com/photo-1516110833967-0b5716ca75d0',
    ],
    organizers: [
      {
        name: 'Dr. Sarah Chen',
        title: 'Robotics Engineer, TechCorp',
        bio: 'Leading robotics researcher with 15+ years experience in autonomous systems.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c1c5de',
      },
      {
        name: 'Prof. Michael Rodriguez',
        title: 'Computer Science, Stanford University',
        bio: 'Professor specializing in AI and machine learning applications in robotics.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      },
    ],
    sponsors: [
      {
        name: 'TechCorp',
        tier: 'Title',
        logo: 'https://via.placeholder.com/120x40/3B82F6/white?text=TechCorp',
      },
      {
        name: 'RoboTools',
        tier: 'Gold',
        logo: 'https://via.placeholder.com/100x40/10B981/white?text=RoboTools',
      },
    ],
    requirements: [
      'Basic programming knowledge (Python or C++ preferred)',
      'Understanding of electronics and sensors',
      'Team of 2-4 members',
      'Bring your own laptop and development tools',
    ],
    schedule: [
      { time: '5:30 PM', activity: 'Registration & Check-in' },
      { time: '6:00 PM', activity: 'Opening Ceremony & Rule Explanation' },
      { time: '6:30 PM', activity: 'Robot Inspection & Practice Runs' },
      { time: '7:30 PM', activity: 'Qualification Round' },
      { time: '8:30 PM', activity: 'Semifinal Round' },
      { time: '9:00 PM', activity: 'Final Round' },
      { time: '9:30 PM', activity: 'Awards Ceremony' },
    ],
  };

  return mockEvent;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { micrositeSlug, subEventSlug } = await params;
  const event = await getEventData(micrositeSlug, subEventSlug);

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.',
    };
  }

  return {
    title: `${event.title} - ${micrositeSlug}`,
    description: event.shortDesc,
    openGraph: {
      title: event.title,
      description: event.shortDesc,
      images: [{ url: event.featuredImage }],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { micrositeSlug, subEventSlug } = await params;
  const event = await getEventData(micrositeSlug, subEventSlug);

  if (!event) {
    notFound();
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  const startDateTime = formatDateTime(event.startsAt);
  const endDateTime = formatDateTime(event.endsAt);
  const isFull = event.registeredCount >= event.capacity;
  const spotsLeft = event.capacity - event.registeredCount;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/m/${micrositeSlug}/events`}
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={event.featuredImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="default">{event.type}</Badge>
                  <Badge variant="outline">{event.track}</Badge>
                  <Badge variant="secondary">{event.difficulty}</Badge>
                  {event.registrationType === 'paid' && (
                    <Badge variant="secondary">Paid Event</Badge>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-foreground mb-4">{event.title}</h1>

                <p className="text-xl text-muted-foreground">{event.shortDesc}</p>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.longDesc }}
                />
              </CardContent>
            </Card>

            {/* Rules */}
            {event.rulesMd && (
              <Card>
                <CardHeader>
                  <CardTitle>Rules & Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: event.rulesMd }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Prizes */}
            {event.prizesMd && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Prizes & Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: event.prizesMd }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Schedule */}
            {event.schedule && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.schedule.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="font-medium text-sm w-20 flex-shrink-0">{item.time}</div>
                        <div className="text-sm text-muted-foreground">{item.activity}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organizers */}
            <Card>
              <CardHeader>
                <CardTitle>Organizers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.organizers.map((organizer, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <img
                        src={organizer.avatar}
                        alt={organizer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{organizer.name}</h4>
                        <p className="text-sm text-muted-foreground">{organizer.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{organizer.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  {isFull ? (
                    <div>
                      <Badge variant="destructive" className="mb-2">
                        Event Full
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {event.waitlistCount} people on waitlist
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {spotsLeft} spots left
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.registeredCount}/{event.capacity} registered
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">
                      {event.registrationType === 'free' ? 'Free' : 'Paid'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <Badge variant="outline" className="text-xs">
                      {event.difficulty}
                    </Badge>
                  </div>
                </div>

                {event.isRegistrationOpen ? (
                  <Button className="w-full" size="lg">
                    {isFull ? 'Join Waitlist' : 'Register Now'}
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Registration Closed
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Registration confirmation will be sent via email
                </p>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{startDateTime.date}</div>
                      <div className="text-sm text-muted-foreground">
                        {startDateTime.time} - {endDateTime.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{event.venue}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.venueDetails.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Capacity: {event.capacity}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.registeredCount} registered
                      </div>
                    </div>
                  </div>
                </div>

                {/* Venue Facilities */}
                {event.venueDetails.facilities && (
                  <div>
                    <h4 className="font-medium mb-2">Venue Facilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {event.venueDetails.facilities.map((facility, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requirements */}
            {event.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {event.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sponsors */}
            {event.sponsors && event.sponsors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sponsors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.sponsors.map((sponsor, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img src={sponsor.logo} alt={sponsor.name} className="h-8 object-contain" />
                        <div>
                          <div className="font-medium text-sm">{sponsor.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {sponsor.tier} Sponsor
                          </div>
                        </div>
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
