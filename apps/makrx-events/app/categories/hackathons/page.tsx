import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HackathonsPage() {
  // SSR/SSG or mock mode: return static fallback UI
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Hackathons (Static Export)</h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a static fallback. Dynamic event data is disabled in static export.
        </p>
      </div>
    );
  }

  const hackathons = [
    {
      id: 'iot-hackathon',
      title: 'IoT Smart Cities Hackathon',
      description:
        '48-hour intensive hackathon focused on Internet of Things solutions for smart cities. Build connected devices that solve real urban challenges.',
      date: 'March 16-17, 2024',
      location: 'San Francisco, CA',
      attendees: 200,
      duration: '48 hours',
      prize: '$15,000',
      deadline: 'March 10, 2024',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3',
      tags: ['IoT', 'Smart Cities', '48h'],
      difficulty: 'Advanced',
    },
    {
      id: 'ai-healthcare-hack',
      title: 'AI for Healthcare Hackathon',
      description:
        'Build AI-powered solutions to improve healthcare accessibility, diagnosis, and patient care using machine learning and data science.',
      date: 'April 22-24, 2024',
      location: 'Boston, MA',
      attendees: 150,
      duration: '72 hours',
      prize: '$20,000',
      deadline: 'April 15, 2024',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3',
      tags: ['AI', 'Healthcare', 'ML'],
      difficulty: 'Intermediate',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <Zap className="inline h-8 w-8 mr-2 text-purple-500" />
            Hackathons
          </h1>
          <p className="text-lg text-gray-600">
            Intensive coding events where teams build innovative solutions in limited time. Perfect
            for rapid prototyping and learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => (
            <Card
              key={hackathon.id}
              className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-purple-500"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={hackathon.image}
                  alt={hackathon.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Hackathon
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-purple-600 text-white">{hackathon.difficulty}</Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  {hackathon.title}
                  <Zap className="h-5 w-5 ml-2 text-purple-500" />
                </CardTitle>
                <CardDescription className="line-clamp-3">{hackathon.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-purple-800 mb-1">Prize Pool</div>
                      <div className="text-lg font-bold text-purple-900">{hackathon.prize}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-purple-800 mb-1">Duration</div>
                      <div className="text-sm text-purple-900">{hackathon.duration}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {hackathon.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {hackathon.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {hackathon.attendees} participants
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Registration deadline: {hackathon.deadline}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {hackathon.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/events/${hackathon.id}`}>View Details</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="default"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Link href={`/events/${hackathon.id}/register`}>Join Hackathon</Link>
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
