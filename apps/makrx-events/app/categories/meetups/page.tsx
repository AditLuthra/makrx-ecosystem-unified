import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Coffee, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

export default function MeetupsPage() {
  // SSR/SSG or mock mode: return static fallback UI
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Meetups (Static Export)</h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a static fallback. Dynamic event data is disabled in static export.
        </p>
      </div>
    );
  }

  const meetups = [
    {
      id: 'maker-networking-sf',
      title: 'SF Maker Community Meetup',
      description:
        'Monthly gathering for makers, engineers, and entrepreneurs to share projects, network, and collaborate on future innovations.',
      date: 'Every 3rd Friday',
      location: 'TechShop San Francisco, CA',
      attendees: 80,
      duration: '3 hours',
      price: 'Free',
      organizer: 'SF Makers Guild',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3',
      tags: ['Networking', 'Community', 'Monthly'],
      type: 'Regular',
    },
    {
      id: 'women-in-making',
      title: 'Women in Making Workshop',
      description:
        'Empowering women in STEM through hands-on making workshops, mentorship, and community building sessions.',
      date: 'April 8, 2024',
      location: 'Austin, TX',
      attendees: 50,
      duration: '4 hours',
      price: 'Free',
      organizer: 'Women Who Make',
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3',
      tags: ['Women in STEM', 'Workshop', 'Mentorship'],
      type: 'Special',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <Coffee className="inline h-8 w-8 mr-2 text-orange-500" />
            Meetups & Networking
          </h1>
          <p className="text-lg text-gray-600">
            Connect with fellow makers, share experiences, and build lasting relationships in the
            maker community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetups.map((meetup) => (
            <Card
              key={meetup.id}
              className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
            >
              <div className="aspect-video relative overflow-hidden">
                <img src={meetup.image} alt={meetup.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Meetup
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-orange-600 text-white">{meetup.type}</Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  {meetup.title}
                  <Coffee className="h-5 w-5 ml-2 text-orange-500" />
                </CardTitle>
                <CardDescription className="line-clamp-3">{meetup.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-orange-800 mb-1">Entry</div>
                      <div className="text-lg font-bold text-orange-900">{meetup.price}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-orange-800 mb-1">Duration</div>
                      <div className="text-sm text-orange-900">{meetup.duration}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {meetup.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {meetup.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {meetup.attendees} expected attendees
                  </div>
                  <div className="flex items-center">
                    <Coffee className="h-4 w-4 mr-2" />
                    Organized by {meetup.organizer}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {meetup.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/events/${meetup.id}`}>Learn More</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="default"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <Link href={`/events/${meetup.id}/register`}>Join Meetup</Link>
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
