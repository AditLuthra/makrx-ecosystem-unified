import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Twitter, Linkedin, Globe, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MicrositeSpeakersPageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeSpeakersPage({ params }: MicrositeSpeakersPageProps) {
  const { micrositeSlug } = await params;

  // Mock data - would fetch from database
  const microsite = {
    slug: micrositeSlug,
    title: 'MakerFest 2024',
  };

  const speakers = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      title: 'Chief Technology Officer',
      company: 'Hardware Innovations Inc',
      type: 'keynote',
      bio: 'Leading expert in hardware acceleration and IoT systems with 15+ years in silicon valley. Former Tesla and Apple engineer specializing in autonomous systems.',
      expertise: ['IoT', 'Hardware Design', 'Autonomous Systems'],
      talk: {
        title: 'The Future of Connected Devices',
        time: 'March 15, 10:00 AM',
        location: 'Main Keynote Theater',
        description: 'Exploring how IoT will reshape industries and daily life in the next decade.',
      },
      social: {
        twitter: '@sarahchen_tech',
        linkedin: 'sarahchen-cto',
        website: 'https://sarahchen.tech',
      },
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      title: 'Founder & CEO',
      company: 'OpenMaker Labs',
      type: 'keynote',
      bio: "Pioneering open source hardware movement and maker education. Built the world's largest network of community makerspaces across 40 countries.",
      expertise: ['Open Source', 'Community Building', 'Education'],
      talk: {
        title: 'Building the Global Maker Movement',
        time: 'March 16, 9:00 AM',
        location: 'Main Keynote Theater',
        description:
          'How maker communities are democratizing innovation and technology access worldwide.',
      },
      social: {
        twitter: '@marcusmakes',
        linkedin: 'marcus-rodriguez-maker',
        website: 'https://openmaker.org',
      },
    },
    {
      id: '3',
      name: 'Dr. Lisa Park',
      title: 'Research Scientist',
      company: 'MIT Media Lab',
      type: 'speaker',
      bio: 'Researching human-computer interaction and creative applications of technology. Published 50+ papers on maker technologies and digital fabrication.',
      expertise: ['HCI', 'Digital Fabrication', 'Research'],
      talk: {
        title: 'Creative Coding for Physical Interfaces',
        time: 'March 15, 2:00 PM',
        location: 'Workshop Room A',
        description:
          'Hands-on workshop combining code and hardware for interactive art installations.',
      },
      social: {
        twitter: '@lisapark_mit',
        linkedin: 'lisa-park-mit',
      },
    },
    {
      id: '4',
      name: 'Ahmed Hassan',
      title: 'Senior Robotics Engineer',
      company: 'SpaceX',
      type: 'speaker',
      bio: 'Designing autonomous systems for space exploration. Expert in robotic perception and control systems with focus on extreme environment applications.',
      expertise: ['Robotics', 'Space Systems', 'AI'],
      talk: {
        title: 'Robotics in Extreme Environments',
        time: 'March 16, 3:00 PM',
        location: 'Competition Arena',
        description:
          'Lessons from building robots for space that apply to terrestrial maker projects.',
      },
      social: {
        twitter: '@ahmed_spacex',
        linkedin: 'ahmed-hassan-robotics',
      },
    },
    {
      id: '5',
      name: 'Jennifer Wu',
      title: 'Founder',
      company: 'FabLab Education',
      type: 'speaker',
      bio: 'Educational technology entrepreneur focused on bringing maker education to underserved communities. Former Google engineer turned social impact maker.',
      expertise: ['Education', 'Social Impact', 'Accessibility'],
      talk: {
        title: 'Inclusive Making: Technology for All',
        time: 'March 17, 11:00 AM',
        location: 'Workshop Room B',
        description:
          'Strategies for making maker technologies accessible across diverse communities.',
      },
      social: {
        linkedin: 'jennifer-wu-fablab',
        website: 'https://fablabedu.org',
      },
    },
    {
      id: '6',
      name: 'Roberto Silva',
      title: 'Co-Founder',
      company: 'Sustainable Electronics',
      type: 'speaker',
      bio: 'Environmental engineer and maker focused on sustainable electronics and circular economy principles in hardware design and manufacturing.',
      expertise: ['Sustainability', 'Electronics', 'Manufacturing'],
      talk: {
        title: 'Green Making: Sustainable Electronics Design',
        time: 'March 17, 2:00 PM',
        location: 'Innovation Showcase',
        description:
          'How to incorporate environmental considerations into maker projects and electronics design.',
      },
      social: {
        twitter: '@roberto_green',
        website: 'https://sustainableelectronics.org',
      },
    },
  ];

  const judges = [
    {
      name: 'Alex Thompson',
      title: 'Principal Engineer, Tesla',
      expertise: ['Automotive', 'Power Electronics'],
    },
    {
      name: 'Maria Santos',
      title: 'Venture Partner, Founders Fund',
      expertise: ['Investment', 'Hardware Startups'],
    },
    {
      name: 'Dr. Kevin Chang',
      title: 'Professor, Stanford University',
      expertise: ['AI/ML', 'Computer Vision'],
    },
  ];

  if (!microsite) {
    notFound();
  }

  const keynoteSpeakers = speakers.filter((s) => s.type === 'keynote');
  const featuredSpeakers = speakers.filter((s) => s.type === 'speaker');

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
              <Link
                href={`/m/${micrositeSlug}/tracks`}
                className="text-gray-700 hover:text-primary"
              >
                Tracks
              </Link>
              <Link href={`/m/${micrositeSlug}/speakers`} className="text-primary font-medium">
                Speakers
              </Link>
              <Link href={`/m/${micrositeSlug}/venue`} className="text-gray-700 hover:text-primary">
                Venue
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Users className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Speakers & Experts</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn from industry leaders, researchers, and innovators shaping the future of making
            and technology.
          </p>
        </div>

        {/* Keynote Speakers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Keynote Speakers</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {keynoteSpeakers.map((speaker) => (
              <Card key={speaker.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    {/* Avatar placeholder */}
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {speaker.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{speaker.name}</CardTitle>
                      <p className="text-primary font-medium">{speaker.title}</p>
                      <p className="text-gray-600">{speaker.company}</p>
                      <Badge className="mt-2 bg-purple-100 text-purple-800">Keynote</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed">{speaker.bio}</p>

                  <div>
                    <h4 className="font-semibold mb-2">Expertise</h4>
                    <div className="flex flex-wrap gap-1">
                      {speaker.expertise.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Talk Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{speaker.talk.title}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {speaker.talk.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {speaker.talk.location}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{speaker.talk.description}</p>
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-3">
                    {speaker.social.twitter && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://twitter.com/${speaker.social.twitter.replace('@', '')}`}
                          target="_blank"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {speaker.social.linkedin && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://linkedin.com/in/${speaker.social.linkedin}`}
                          target="_blank"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {speaker.social.website && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={speaker.social.website} target="_blank">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Speakers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Speakers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSpeakers.map((speaker) => (
              <Card key={speaker.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold">
                      {speaker.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <CardTitle className="text-lg">{speaker.name}</CardTitle>
                    <p className="text-sm text-primary font-medium">{speaker.title}</p>
                    <p className="text-sm text-gray-600">{speaker.company}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700 text-center">
                    {speaker.bio.slice(0, 120)}...
                  </p>

                  <div className="text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {speaker.expertise.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3 text-center">
                    <div className="font-medium text-sm">{speaker.talk.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{speaker.talk.time}</div>
                  </div>

                  <div className="flex justify-center space-x-2">
                    {speaker.social.twitter && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://twitter.com/${speaker.social.twitter.replace('@', '')}`}
                          target="_blank"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {speaker.social.linkedin && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://linkedin.com/in/${speaker.social.linkedin}`}
                          target="_blank"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {speaker.social.website && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={speaker.social.website} target="_blank">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Competition Judges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Competition Judges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {judges.map((judge, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-gray-500 font-bold">
                    {judge.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <h3 className="font-semibold">{judge.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{judge.title}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {judge.expertise.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-none">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Join the Conversation</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Don't miss these incredible speakers and the opportunity to learn from the best in the
              maker community.
            </p>
            <Button asChild>
              <Link href={`/m/${micrositeSlug}/register`}>Register for {microsite.title}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
