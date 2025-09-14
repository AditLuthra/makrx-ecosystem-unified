import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import { Calendar, MapPin, Users, Plus, BarChart3, Settings, Eye } from 'lucide-react';
import Link from 'next/link';

export default function OrganizerDashboard() {
  const myEvents = [
    {
      id: 'arduino-workshop-march',
      title: 'Arduino Basics Workshop',
      status: 'published',
      date: 'March 20, 2024',
      location: 'TechHub Austin',
      registrations: 35,
      capacity: 50,
      revenue: '$1,750',
    },
    {
      id: 'robotics-comp-april',
      title: 'Spring Robotics Competition',
      status: 'draft',
      date: 'April 15, 2024',
      location: 'University Lab',
      registrations: 0,
      capacity: 100,
      revenue: '$0',
    },
  ];

  const stats = {
    totalEvents: 12,
    totalAttendees: 450,
    totalRevenue: '$8,500',
    avgRating: 4.7,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Organizer Dashboard</h1>
            <p className="text-gray-600">Manage your events and track performance</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/create-event">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/m/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Microsite
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalAttendees}</div>
              <div className="text-sm text-gray-600">Total Attendees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalRevenue}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.avgRating}★</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Events */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      My Events
                    </CardTitle>
                    <CardDescription>Manage your created events</CardDescription>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/create-event">
                      <Plus className="h-4 w-4 mr-2" />
                      New Event
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {myEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <Badge
                        variant={event.status === 'published' ? 'default' : 'secondary'}
                        className={event.status === 'published' ? 'bg-green-600' : ''}
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
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {event.registrations}/{event.capacity} registered
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="font-medium">Revenue: </span>
                        {event.revenue}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest registrations and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <div className="text-sm">
                    <span className="font-medium">Sarah Chen</span> registered for Arduino Workshop
                  </div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="text-sm">
                    <span className="font-medium">Mike Rodriguez</span> registered for Arduino
                    Workshop
                  </div>
                  <div className="text-xs text-gray-500">4 hours ago</div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="text-sm">
                    Event <span className="font-medium">Arduino Workshop</span> reached 70% capacity
                  </div>
                  <div className="text-xs text-gray-500">1 day ago</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/create-event">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/m/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Microsite
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Event Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Event Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full text-left justify-start" variant="ghost" size="sm">
                  Workshop Template
                </Button>
                <Button className="w-full text-left justify-start" variant="ghost" size="sm">
                  Competition Template
                </Button>
                <Button className="w-full text-left justify-start" variant="ghost" size="sm">
                  Meetup Template
                </Button>
                <Button className="w-full text-left justify-start" variant="ghost" size="sm">
                  Conference Template
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" size="sm">
                  View Documentation
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  Contact Support
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  Join Community
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
