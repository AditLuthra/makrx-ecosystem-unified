import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import { Calendar, MapPin, Award, QrCode, Heart, Clock } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
  const upcomingEvents = [
    {
      id: 'maker-fest-2024',
      title: 'Maker Fest 2024',
      date: 'March 15-17, 2024',
      location: 'San Francisco, CA',
      status: 'confirmed',
      ticketType: 'Free',
      qrCode: 'MF2024-ABC123',
    },
    {
      id: '3d-printing-workshop',
      title: '3D Printing Workshop',
      date: 'May 5, 2024',
      location: 'Austin, TX',
      status: 'pending',
      ticketType: 'Paid',
      price: '$120',
    },
  ];

  const pastEvents = [
    {
      id: 'robotics-workshop-2023',
      title: 'Arduino Robotics Workshop',
      date: 'December 10, 2023',
      location: 'Seattle, WA',
      certificate: true,
      badge: 'Arduino Certified',
    },
  ];

  const wishlist = [
    {
      id: 'ai-conference-2024',
      title: 'AI & Machine Learning Conference',
      date: 'June 12-14, 2024',
      location: 'New York, NY',
      price: '$299',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your events, tickets, and achievements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Your registered events and tickets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <Badge
                        variant={event.status === 'confirmed' ? 'default' : 'secondary'}
                        className={event.status === 'confirmed' ? 'bg-green-600' : ''}
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="font-medium">Ticket: </span>
                        {event.ticketType} {event.price && `(${event.price})`}
                      </div>
                      <div className="flex gap-2">
                        {event.qrCode && (
                          <Button size="sm" variant="outline">
                            <QrCode className="h-4 w-4 mr-1" />
                            View Ticket
                          </Button>
                        )}
                        <Button asChild size="sm">
                          <Link href={`/events/${event.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Past Events & Certificates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Past Events & Achievements
                </CardTitle>
                <CardDescription>Your completed events and earned certificates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pastEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      {event.certificate && (
                        <Badge className="bg-blue-600">
                          <Award className="h-3 w-3 mr-1" />
                          Certified
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      {event.badge && (
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2" />
                          {event.badge}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Download Certificate
                      </Button>
                      <Button size="sm" variant="outline">
                        Share on LinkedIn
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Events Attended</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-sm text-gray-600">Certificates Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">2</div>
                  <div className="text-sm text-gray-600">Upcoming Events</div>
                </div>
              </CardContent>
            </Card>

            {/* Wishlist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Wishlist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {wishlist.map((event) => (
                  <div key={event.id} className="border rounded p-3">
                    <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium">{event.price}</span>
                      <Button size="sm" variant="outline" className="text-xs">
                        Register
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/events">Browse Events</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/dashboard/organizer">Become Organizer</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
