import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import { Calendar, MapPin, Users, Eye, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ExposPage() {
  const expos = [
    {
      id: 'maker-showcase-2024',
      title: 'Maker Innovation Showcase',
      description:
        'Exhibition of cutting-edge maker projects, prototypes, and innovations from creators worldwide. See the future of making today.',
      date: 'May 18-20, 2024',
      location: 'Convention Center, Portland, OR',
      attendees: 5000,
      duration: '3 days',
      price: '$25/day',
      exhibitors: 200,
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3',
      tags: ['Innovation', 'Showcase', 'Networking'],
      type: 'Exhibition',
    },
    {
      id: 'tech-startup-expo',
      title: 'Tech Startup & Hardware Expo',
      description:
        'Discover the latest in hardware startups, emerging technologies, and investment opportunities in the maker ecosystem.',
      date: 'June 5-7, 2024',
      location: 'Tech Square, Atlanta, GA',
      attendees: 3000,
      duration: '3 days',
      price: '$40/day',
      exhibitors: 150,
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3',
      tags: ['Startups', 'Hardware', 'Investment'],
      type: 'Business Expo',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <Eye className="inline h-8 w-8 mr-2 text-indigo-500" />
            Exhibitions & Expos
          </h1>
          <p className="text-lg text-gray-600">
            Discover the latest innovations, connect with industry leaders, and explore cutting-edge
            maker technologies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expos.map((expo) => (
            <Card
              key={expo.id}
              className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500"
            >
              <div className="aspect-video relative overflow-hidden">
                <img src={expo.image} alt={expo.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                    Exhibition
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-indigo-600 text-white">{expo.type}</Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  {expo.title}
                  <Eye className="h-5 w-5 ml-2 text-indigo-500" />
                </CardTitle>
                <CardDescription className="line-clamp-3">{expo.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-indigo-800 mb-1">Admission</div>
                      <div className="text-lg font-bold text-indigo-900">{expo.price}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-indigo-800 mb-1">Exhibitors</div>
                      <div className="text-sm text-indigo-900">{expo.exhibitors}+</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {expo.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {expo.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {expo.attendees} expected visitors
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {expo.duration} event
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {expo.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/events/${expo.id}`}>Learn More</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="default"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Link href={`/events/${expo.id}/register`}>Get Tickets</Link>
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
