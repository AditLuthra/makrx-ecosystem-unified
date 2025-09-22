'use client';

import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function CreateEventContent() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    type: 'workshop',
    location: '',
    startDate: '',
    endDate: '',
    registrationFee: '0',
    maxAttendees: '',
    features: {
      competitions: false,
      workshops: true,
      exhibitions: false,
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/events', data);
    },
    onSuccess: () => {
      toast({
        title: 'Event Created',
        description: 'Your event has been created successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      router.push('/admin');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.location) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    createEventMutation.mutate({
      ...formData,
      slug,
      featuredFlags: formData.features,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Create New Event</h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Share your maker event with the community
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Event Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your event in detail"
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief one-line description"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="exhibition">Exhibition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Event location or 'Online'"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date & Time</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationFee">Registration Fee ($)</Label>
                  <Input
                    id="registrationFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.registrationFee}
                    onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxAttendees">Max Attendees</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    min="1"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Event Features</Label>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="workshops" className="text-sm">
                      Include Workshops
                    </Label>
                    <Switch
                      id="workshops"
                      checked={formData.features.workshops}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          features: { ...formData.features, workshops: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="competitions" className="text-sm">
                      Include Competitions
                    </Label>
                    <Switch
                      id="competitions"
                      checked={formData.features.competitions}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          features: { ...formData.features, competitions: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exhibitions" className="text-sm">
                      Include Exhibitions
                    </Label>
                    <Switch
                      id="exhibitions"
                      checked={formData.features.exhibitions}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          features: { ...formData.features, exhibitions: checked },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1" disabled={createEventMutation.isPending}>
                  {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

export default function CreateEvent() {
  // SSR/SSG or mock mode: return static fallback UI
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Create Event (Static Export)</h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a static fallback. Event creation is disabled in static export.
        </p>
      </div>
    );
  }

  return <CreateEventContent />;
}
