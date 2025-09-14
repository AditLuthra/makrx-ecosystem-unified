'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Ticket,
  Users,
  Settings,
  Plus,
  Eye,
  QrCode,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Dashboard() {
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user-stats"],
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  // Mock user data since we don't have auth
  const userData = {
    name: "John Smith",
    email: "john.smith@example.com",
    profileImage: "/api/placeholder/40/40",
    stats: (userStats as any)?.user || {
      eventsAttended: 2,
      eventsCreated: 1,
      totalSpent: 85,
      upcomingEvents: 2
    }
  };

  const upcomingRegistrations = [
    {
      id: "reg_001",
      eventTitle: "MakerFest 2024 - Arduino Workshop",
      eventSlug: "makerfest2024",
      subEventTitle: "Arduino Basics",
      date: "2024-03-15T10:00:00Z",
      location: "TechHub SF",
      status: "confirmed",
      price: 45,
      qrCode: "/api/qr/reg_001",
      checkInStatus: "not_checked_in"
    },
    {
      id: "reg_002",
      eventTitle: "Bay Area Hackathon 2024",
      eventSlug: "bay-hackathon-2024",
      subEventTitle: "Main Event",
      date: "2024-03-22T18:00:00Z",
      location: "Stanford University",
      status: "confirmed",
      price: 0,
      qrCode: "/api/qr/reg_002",
      checkInStatus: "not_checked_in"
    }
  ];

  const pastRegistrations = [
    {
      id: "reg_003",
      eventTitle: "3D Printing Workshop",
      eventSlug: "3d-printing-workshop",
      subEventTitle: "Advanced Techniques",
      date: "2024-02-15T14:00:00Z",
      location: "Maker Space",
      status: "attended",
      price: 35,
      checkInStatus: "checked_in",
      rating: 5
    }
  ];

  if (statsLoading || eventsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* User Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-blue-100">{userData.email}</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{userData.stats.eventsAttended}</div>
              <div className="text-sm text-blue-100">Events Attended</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{userData.stats.eventsCreated}</div>
              <div className="text-sm text-blue-100">Events Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${userData.stats.totalSpent}</div>
              <div className="text-sm text-blue-100">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{userData.stats.upcomingEvents}</div>
              <div className="text-sm text-blue-100">Upcoming</div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <Tabs defaultValue="registrations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="registrations">My Registrations</TabsTrigger>
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-6">
            <div className="grid gap-6">
              {/* Upcoming Registrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>
                    Events you're registered for
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingRegistrations.map((registration) => (
                    <div key={registration.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{registration.eventTitle}</h4>
                          <p className="text-sm text-muted-foreground">{registration.subEventTitle}</p>
                        </div>
                        <Badge variant={registration.status === 'confirmed' ? 'default' : 'secondary'}>
                          {registration.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(registration.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {registration.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          {registration.price > 0 ? `$${registration.price}` : 'Free'}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/m/${registration.eventSlug}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Event
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <QrCode className="w-4 h-4 mr-1" />
                          QR Code
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Past Registrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Event History</CardTitle>
                  <CardDescription>
                    Your past event experiences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pastRegistrations.map((registration) => (
                    <div key={registration.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{registration.eventTitle}</h4>
                          <p className="text-sm text-muted-foreground">{registration.subEventTitle}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Attended</Badge>
                          {registration.rating && (
                            <div className="flex items-center">
                              {[...Array(registration.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(registration.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {registration.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My Events</CardTitle>
                    <CardDescription>
                      Events you've created and manage
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/create-event">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't created any events yet.</p>
                  <p className="text-sm">Get started by creating your first event!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Participation Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Events Attended</span>
                      <span className="font-medium">{userData.stats.eventsAttended}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Spent</span>
                      <span className="font-medium">${userData.stats.totalSpent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average per Event</span>
                      <span className="font-medium">
                        ${userData.stats.eventsAttended > 0 
                          ? Math.round(userData.stats.totalSpent / userData.stats.eventsAttended) 
                          : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Events</span>
                      <span className="font-medium">{(userStats as any)?.platform?.totalEvents || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Users</span>
                      <span className="font-medium">{(userStats as any)?.platform?.totalUsers || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Display Name</label>
                    <input 
                      type="text" 
                      value={userData.name} 
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input 
                      type="email" 
                      value={userData.email} 
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      readOnly
                    />
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" disabled>
                      Authentication settings require login
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}