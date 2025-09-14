'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Trophy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

// Section type definitions
export interface SectionData {
  id: string;
  type: string;
  order: number;
  isVisible: boolean;
  contentJson: any;
}

interface SectionRendererProps {
  sections: SectionData[];
  micrositeSlug: string;
  editMode?: boolean;
}

// Individual section components
function HeroSection({ content, micrositeSlug }: { content: any; micrositeSlug: string }) {
  const {
    title = 'Event Title',
    subtitle = 'Event Subtitle',
    description,
    backgroundImage,
    ctaText = 'Register Now',
    ctaUrl = `/m/${micrositeSlug}/register`,
    startDate,
    endDate,
    location,
  } = content;

  return (
    <section
      className="relative bg-gradient-to-r from-primary/90 to-primary text-white py-20 px-4"
      style={
        backgroundImage
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">{title}</h1>
        {subtitle && <p className="text-xl md:text-2xl mb-6 text-white/90">{subtitle}</p>}
        {description && (
          <p className="text-lg mb-8 text-white/80 max-w-2xl mx-auto">{description}</p>
        )}

        {(startDate || endDate || location) && (
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-white/90">
            {startDate && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {new Date(startDate).toLocaleDateString()}
                {endDate && ` - ${new Date(endDate).toLocaleDateString()}`}
              </div>
            )}
            {location && (
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {location}
              </div>
            )}
          </div>
        )}

        <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
          <Link href={ctaUrl}>{ctaText}</Link>
        </Button>
      </div>
    </section>
  );
}

function AboutSection({ content }: { content: any }) {
  const {
    title = 'About This Event',
    description = '',
    features = [],
    stats = [],
    images = [],
  } = content;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{title}</h2>
          {description && (
            <div className="prose prose-lg max-w-4xl mx-auto text-gray-600">
              {description.split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>

        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-primary rounded-full mr-4"></div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ScheduleSection({ content, micrositeSlug }: { content: any; micrositeSlug: string }) {
  const { title = 'Event Schedule', showFullSchedule = true, highlightedEvents = [] } = content;

  // Mock schedule data - would come from sub-events
  const mockEvents = [
    {
      id: '1',
      title: 'Registration & Welcome',
      time: '9:00 AM',
      type: 'general',
      location: 'Main Lobby',
    },
    {
      id: '2',
      title: 'Opening Keynote',
      time: '10:00 AM',
      type: 'keynote',
      location: 'Main Theater',
    },
    {
      id: '3',
      title: '3D Printing Workshop',
      time: '11:00 AM',
      type: 'workshop',
      location: 'Workshop Room A',
    },
    {
      id: '4',
      title: 'Robot Competition',
      time: '2:00 PM',
      type: 'competition',
      location: 'Arena',
    },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      event.type === 'keynote'
                        ? 'default'
                        : event.type === 'competition'
                          ? 'destructive'
                          : event.type === 'workshop'
                            ? 'secondary'
                            : 'outline'
                    }
                  >
                    {event.type}
                  </Badge>
                  <span className="text-sm font-medium text-primary">{event.time}</span>
                </div>
                <CardTitle className="text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {event.location}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showFullSchedule && (
          <div className="text-center">
            <Button asChild>
              <Link href={`/m/${micrositeSlug}/schedule`}>View Full Schedule</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function SponsorsSection({ content }: { content: any }) {
  const { title = 'Our Sponsors', tiers = ['Gold', 'Silver', 'Bronze'], sponsors = {} } = content;

  // Mock sponsor data
  const mockSponsors = {
    Gold: [
      { name: 'TechCorp', logo: null },
      { name: 'InnovateNow', logo: null },
    ],
    Silver: [
      { name: 'CircuitFlow', logo: null },
      { name: 'MakerSpace Pro', logo: null },
      { name: 'RoboTech', logo: null },
    ],
    Bronze: [
      { name: 'Code Academy', logo: null },
      { name: 'Hardware Hub', logo: null },
    ],
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{title}</h2>
        </div>

        <div className="space-y-12">
          {tiers.map((tier: string) => (
            <div key={tier}>
              <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">{tier} Sponsors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {(mockSponsors[tier as keyof typeof mockSponsors] || []).map(
                  (sponsor: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-center p-6 bg-gray-50 rounded-lg"
                    >
                      {sponsor.logo ? (
                        <img src={sponsor.logo} alt={sponsor.name} className="max-h-16" />
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-500">
                              {sponsor.name.substring(0, 2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{sponsor.name}</span>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ content }: { content: any }) {
  const { title = 'Frequently Asked Questions', faqs = [] } = content;

  // Mock FAQ data
  const mockFAQs = [
    {
      question: 'When is the event?',
      answer: 'The event takes place March 15-17, 2024 at the Moscone Center in San Francisco.',
    },
    {
      question: 'How do I register?',
      answer: "You can register through our website by clicking the 'Register Now' button.",
    },
    {
      question: 'What should I bring?',
      answer:
        'Bring a valid ID, comfortable shoes, and a notebook. All workshop materials are provided.',
    },
    {
      question: 'Is parking available?',
      answer: 'Yes, the venue has parking available. We also recommend public transportation.',
    },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{title}</h2>
        </div>

        <div className="space-y-4">
          {(faqs.length > 0 ? faqs : mockFAQs).map((faq: any, index: number) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CustomSection({ content }: { content: any }) {
  const { title, html, markdown } = content;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{title}</h2>
          </div>
        )}

        {html && <div dangerouslySetInnerHTML={{ __html: html }} />}

        {markdown && (
          <div className="prose prose-lg max-w-none">
            {/* Would use a markdown parser here */}
            <p>{markdown}</p>
          </div>
        )}
      </div>
    </section>
  );
}

// Main renderer component
export function SectionRenderer({
  sections,
  micrositeSlug,
  editMode = false,
}: SectionRendererProps) {
  const visibleSections = sections
    .filter((section) => section.isVisible || editMode)
    .sort((a, b) => a.order - b.order);

  const renderSection = (section: SectionData) => {
    const sectionProps = { content: section.contentJson, micrositeSlug };

    let component: ReactNode = null;

    switch (section.type) {
      case 'hero':
        component = <HeroSection {...sectionProps} />;
        break;
      case 'about':
        component = <AboutSection {...sectionProps} />;
        break;
      case 'schedule':
        component = <ScheduleSection {...sectionProps} />;
        break;
      case 'sponsors':
        component = <SponsorsSection {...sectionProps} />;
        break;
      case 'faq':
        component = <FAQSection {...sectionProps} />;
        break;
      case 'custom':
        component = <CustomSection {...sectionProps} />;
        break;
      default:
        component = (
          <section className="py-16 px-4 bg-gray-100">
            <div className="max-w-6xl mx-auto text-center">
              <p className="text-gray-500">Unknown section type: {section.type}</p>
            </div>
          </section>
        );
    }

    if (editMode) {
      return (
        <div key={section.id} className="relative group">
          <div className={`${!section.isVisible ? 'opacity-50' : ''}`}>{component}</div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-lg p-2 flex space-x-2">
            <Button size="sm" variant="outline">
              Edit
            </Button>
            <Button size="sm" variant="outline">
              Move
            </Button>
            <Button size="sm" variant="outline">
              Delete
            </Button>
          </div>
        </div>
      );
    }

    return <div key={section.id}>{component}</div>;
  };

  return (
    <div className="min-h-screen">
      {visibleSections.map(renderSection)}

      {editMode && (
        <section className="py-16 px-4 bg-gray-50 border-2 border-dashed border-gray-300">
          <div className="max-w-6xl mx-auto text-center">
            <Button variant="outline">
              <span className="text-xl mr-2">+</span>
              Add Section
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

export default SectionRenderer;
