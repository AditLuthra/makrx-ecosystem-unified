import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

export default function CompetitionsPage() {
  // SSR/SSG or mock mode: return static fallback UI
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Competitions (Static Export)</h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a static fallback. Dynamic event data is disabled in static export.
        </p>
      </div>
    );
  }

  const competitions = [
    {
      id: 'robotics-championship',
      title: 'Robotics Championship',
      description:
        'Build and program autonomous robots to compete in challenging tasks. Teams of 3-5 members design, build, and code robots for multiple competition rounds.',
      date: 'April 20, 2024',
      location: 'Boston, MA',
      attendees: 150,
      prize: '$10,000',
      deadline: 'April 10, 2024',
      image:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      tags: ['Robotics', 'Programming', 'Engineering'],
      difficulty: 'Intermediate',
    },
    {
      id: 'iot-hackathon',
      title: 'IoT Hackathon',
      description:
        '48-hour intensive hackathon focused on Internet of Things solutions for smart cities. Build connected devices that solve real urban challenges.',
      date: 'March 16-17, 2024',
      location: 'San Francisco, CA (Part of Maker Fest)',
      attendees: 200,
      prize: '$15,000',
      deadline: 'March 10, 2024',
      image:
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80',
      tags: ['IoT', 'Smart Cities', 'Hackathon'],
      difficulty: 'Advanced',
    },
    {
      id: 'drone-racing',
      title: 'FPV Drone Racing Championship',
      description:
        'High-speed FPV drone racing through challenging courses. Pilots control custom-built racing drones in real-time competitive races.',
      date: 'June 8, 2024',
      location: 'Las Vegas, NV',
      attendees: 100,
      prize: '$8,000',
      deadline: 'May 25, 2024',
      image:
        'https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      tags: ['Drones', 'Racing', 'FPV'],
      difficulty: 'Intermediate',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <Trophy className="inline h-8 w-8 mr-2 text-yellow-500" />
            Competitions
          </h1>
          <p className="text-lg text-gray-600">
            Test your skills against other makers in exciting competitive events. From robotics to
            hackathons, find the perfect challenge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => (
            <Card
              key={competition.id}
              className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={competition.image}
                  alt={competition.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Competition
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge
                    className={`${
                      competition.difficulty === 'Beginner'
                        ? 'bg-green-500'
                        : competition.difficulty === 'Intermediate'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    } text-white`}
                  >
                    {competition.difficulty}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  {competition.title}
                  <Trophy className="h-5 w-5 ml-2 text-yellow-500" />
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {competition.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-yellow-800 mb-1">Prize Pool</div>
                  <div className="text-lg font-bold text-yellow-900">{competition.prize}</div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {competition.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {competition.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {competition.attendees} participants
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Registration deadline: {competition.deadline}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {competition.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/events/${competition.id}`}>View Details</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="default"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Link href={`/events/${competition.id}/register`}>Compete</Link>
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
