import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Trophy,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MicrositeEventsAdminPageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeEventsAdminPage({ params }: MicrositeEventsAdminPageProps) {
  const { micrositeSlug } = await params;

  // Mock data - would fetch from database
  const microsite = {
    slug: micrositeSlug,
    title: 'MakerFest 2024',
  };

  const subEvents = [
    {
      id: '1',
      slug: 'autonomous-robot-competition',
      title: 'Autonomous Robot Competition',
      type: 'competition',
      track: 'robotics',
      status: 'published',
      registrationType: 'free',
      capacity: 50,
      registered: 23,
      startsAt: '2024-03-15T14:00:00',
      endsAt: '2024-03-15T18:00:00',
      location: 'Competition Arena',
      shortDesc: 'Build and program robots to navigate an obstacle course autonomously.',
    },
    {
      id: '2',
      slug: '3d-printing-mastery',
      title: '3D Printing Mastery Workshop',
      type: 'workshop',
      track: 'manufacturing',
      status: 'published',
      registrationType: 'paid',
      capacity: 25,
      registered: 25,
      startsAt: '2024-03-15T10:00:00',
      endsAt: '2024-03-15T12:00:00',
      location: 'Workshop Room A',
      shortDesc: 'Advanced techniques for precision 3D printing and post-processing.',
    },
    {
      id: '3',
      slug: 'iot-sensors-workshop',
      title: 'IoT Sensor Networks',
      type: 'workshop',
      track: 'iot',
      status: 'draft',
      registrationType: 'free',
      capacity: 30,
      registered: 0,
      startsAt: '2024-03-16T09:00:00',
      endsAt: '2024-03-16T11:00:00',
      location: 'Workshop Room B',
      shortDesc: 'Build wireless sensor networks using Arduino and LoRa.',
    },
    {
      id: '4',
      slug: 'pcb-design-fundamentals',
      title: 'PCB Design Fundamentals',
      type: 'workshop',
      track: 'electronics',
      status: 'published',
      registrationType: 'paid',
      capacity: 20,
      registered: 18,
      startsAt: '2024-03-16T14:00:00',
      endsAt: '2024-03-16T17:00:00',
      location: 'Electronics Lab',
      shortDesc: 'Learn professional PCB design using industry-standard tools.',
    },
    {
      id: '5',
      slug: 'creative-coding-installation',
      title: 'Creative Coding Installation',
      type: 'exhibition',
      track: 'creative',
      status: 'published',
      registrationType: 'external',
      capacity: null,
      registered: 45,
      startsAt: '2024-03-15T09:00:00',
      endsAt: '2024-03-17T18:00:00',
      location: 'Gallery Space',
      shortDesc: 'Interactive art installations combining code and physical interfaces.',
    },
  ];

  const stats = {
    total: subEvents.length,
    published: subEvents.filter((e) => e.status === 'published').length,
    draft: subEvents.filter((e) => e.status === 'draft').length,
    totalRegistrations: subEvents.reduce((sum, e) => sum + e.registered, 0),
  };

  if (!microsite) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href={`/m/${micrositeSlug}/admin`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link href={`/m/${micrositeSlug}/admin/events/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-Event
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Calendar className="inline h-8 w-8 mr-3" />
            Sub-Events Management
          </h1>
          <p className="text-gray-600">
            Manage competitions, workshops, and exhibitions for your microsite
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <div className="text-sm text-gray-600">Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
              <div className="text-sm text-gray-600">Drafts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalRegistrations}</div>
              <div className="text-sm text-gray-600">Total Registrations</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search events..." className="pl-10" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          {subEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          event.type === 'competition'
                            ? 'border-blue-200 text-blue-700'
                            : event.type === 'workshop'
                              ? 'border-green-200 text-green-700'
                              : 'border-purple-200 text-purple-700'
                        }
                      >
                        {event.type}
                      </Badge>
                      <Badge variant="outline">{event.track}</Badge>
                    </div>

                    <p className="text-gray-600 mb-3">{event.shortDesc}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.startsAt).toLocaleDateString()} at{' '}
                        {new Date(event.startsAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {event.registered}/{event.capacity || '∞'} registered
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            event.registrationType === 'free'
                              ? 'bg-green-500'
                              : event.registrationType === 'paid'
                                ? 'bg-blue-500'
                                : 'bg-gray-500'
                          }`}
                        ></span>
                        {event.registrationType}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/m/${micrositeSlug}/events/${event.slug}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/m/${micrositeSlug}/admin/events/${event.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Registration Progress */}
                {event.capacity && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Registration Progress</span>
                      <span>{Math.round((event.registered / event.capacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          event.registered >= event.capacity
                            ? 'bg-red-500'
                            : event.registered / event.capacity > 0.8
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((event.registered / event.capacity) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common event management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href={`/m/${micrositeSlug}/admin/events/new?type=competition`}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Add Competition
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/m/${micrositeSlug}/admin/events/new?type=workshop`}>
                  <Users className="h-4 w-4 mr-2" />
                  Add Workshop
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/m/${micrositeSlug}/admin/events/bulk-import`}>Import Events</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/m/${micrositeSlug}/admin/events/templates`}>Event Templates</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
