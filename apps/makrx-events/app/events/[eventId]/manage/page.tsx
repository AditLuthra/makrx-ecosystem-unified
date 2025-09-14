'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, CheckCircle, Clock, Search, Plus, Settings, BarChart3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

interface CheckIn {
  id: string;
  userId: string;
  checkedInAt: string;
  notes: string | null;
  user: User;
}

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  format: string;
  status: string;
  maxParticipants: number | null;
  currentRound: number;
  createdAt: string;
}

interface Registration {
  id: string;
  userId: string;
  type: string;
  status: string;
  user: User;
}

export default function EventManagePage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Fetch event registrations
  const { data: registrations, isLoading: loadingRegistrations } = useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/registrations`);
      if (!response.ok) throw new Error('Failed to fetch registrations');
      return response.json() as Promise<Registration[]>;
    },
  });

  // Fetch check-ins
  const { data: checkIns, isLoading: loadingCheckIns } = useQuery({
    queryKey: ['event-checkins', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/check-ins`);
      if (!response.ok) throw new Error('Failed to fetch check-ins');
      return response.json() as Promise<CheckIn[]>;
    },
  });

  // Fetch tournaments
  const { data: tournaments, isLoading: loadingTournaments } = useQuery({
    queryKey: ['event-tournaments', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/tournaments`);
      if (!response.ok) throw new Error('Failed to fetch tournaments');
      return response.json() as Promise<Tournament[]>;
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async ({ userId, notes }: { userId: string; notes: string }) => {
      const response = await fetch(`/api/events/${eventId}/check-ins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          checkedInBy: 'current-user-id', // Replace with actual user ID
          notes,
        }),
      });
      if (!response.ok) throw new Error('Failed to check in participant');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-checkins', eventId] });
      toast({ title: 'Success', description: 'Participant checked in successfully' });
      setSelectedUser('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to check in participant',
        variant: 'destructive',
      });
    },
  });

  const filteredRegistrations =
    registrations?.filter(
      (reg) =>
        reg.user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const checkedInUserIds = new Set(checkIns?.map((ci) => ci.userId) || []);
  const checkedInCount = checkIns?.length || 0;
  const totalRegistrations = registrations?.length || 0;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Event Day Management</h1>
          <p className="text-muted-foreground">Manage participant check-ins and competitions</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            <Users className="w-4 h-4 mr-1" />
            {checkedInCount}/{totalRegistrations} checked in
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="checkins" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checkins" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Check-ins
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Participant Check-ins</CardTitle>
              <CardDescription>
                Search and check in registered participants as they arrive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search participants by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loadingRegistrations ? (
                  <div className="text-center py-8">Loading participants...</div>
                ) : filteredRegistrations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? 'No participants found matching your search'
                      : 'No registrations found'}
                  </div>
                ) : (
                  filteredRegistrations.map((registration) => {
                    const isCheckedIn = checkedInUserIds.has(registration.userId);
                    return (
                      <div
                        key={registration.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          isCheckedIn ? 'bg-green-50 border-green-200' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isCheckedIn ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                          <div>
                            <p className="font-medium">
                              {registration.user.firstName} {registration.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {registration.user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={isCheckedIn ? 'default' : 'secondary'}>
                            {isCheckedIn ? 'Checked In' : registration.status}
                          </Badge>
                          {!isCheckedIn && (
                            <Button
                              size="sm"
                              onClick={() => {
                                checkInMutation.mutate({
                                  userId: registration.userId,
                                  notes: '',
                                });
                              }}
                              disabled={checkInMutation.isPending}
                            >
                              Check In
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Competition Management</CardTitle>
                <CardDescription>Create and manage tournaments for your event</CardDescription>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Tournament
              </Button>
            </CardHeader>
            <CardContent>
              {loadingTournaments ? (
                <div className="text-center py-8">Loading tournaments...</div>
              ) : tournaments?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tournaments created yet</p>
                  <p className="text-sm">Create your first tournament to get started</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {tournaments?.map((tournament) => (
                    <Card key={tournament.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{tournament.name}</CardTitle>
                          <Badge
                            variant={
                              tournament.status === 'completed'
                                ? 'default'
                                : tournament.status === 'in_progress'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {tournament.status}
                          </Badge>
                        </div>
                        <CardDescription>{tournament.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Format:</span>
                            <span className="capitalize">{tournament.format}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Participants:</span>
                            <span>{tournament.maxParticipants || 'Unlimited'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Current Round:</span>
                            <span>{tournament.currentRound}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Settings className="w-4 h-4 mr-1" />
                            Manage
                          </Button>
                          <Button size="sm" className="flex-1">
                            <Trophy className="w-4 h-4 mr-1" />
                            View Bracket
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRegistrations}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Checked In</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{checkedInCount}</div>
                <p className="text-xs text-muted-foreground">
                  {totalRegistrations > 0
                    ? Math.round((checkedInCount / totalRegistrations) * 100)
                    : 0}
                  % of registrations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tournaments?.filter((t) => t.status === 'in_progress').length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Check-ins</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRegistrations - checkedInCount}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
