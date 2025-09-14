import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import Link from "next/link";

export default function EventsPage() {
  const events = [
    {
      id: "maker-fest-2024",
      title: "Maker Fest 2024",
      description: "Annual maker festival featuring competitions, workshops, and exhibitions showcasing innovative projects and technologies.",
      type: "festival",
      date: "March 15-17, 2024",
      location: "San Francisco, CA",
      attendees: 2500,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["Festival", "Competition", "Workshop"],
      subEvents: ["Robotics Championship", "3D Printing Workshop", "IoT Hackathon"]
    },
    {
      id: "robotics-championship",
      title: "Robotics Championship",
      description: "Competitive robotics event where teams build and program autonomous robots to complete challenging tasks.",
      type: "competition",
      date: "April 20, 2024",
      location: "Boston, MA",
      attendees: 150,
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["Competition", "Robotics"],
      subEvents: []
    },
    {
      id: "3d-printing-workshop",
      title: "3D Printing Workshop",
      description: "Hands-on workshop covering 3D modeling, printing techniques, and post-processing for beginners and intermediate makers.",
      type: "workshop",
      date: "May 5, 2024",
      location: "Austin, TX",
      attendees: 50,
      image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      tags: ["Workshop", "3D Printing"],
      subEvents: []
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Events</h1>
          <p className="text-lg text-gray-600">
            Discover maker events including festivals, competitions, and workshops happening around the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant="secondary" 
                    className={`${
                      event.type === 'festival' ? 'bg-purple-100 text-purple-800' :
                      event.type === 'competition' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
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
                    {event.attendees} expected attendees
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {event.subEvents.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Includes:</h4>
                    <div className="text-xs text-gray-600">
                      {event.subEvents.join(", ")}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/events/${event.id}`}>
                      Learn More
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link href={`/events/${event.id}/register`}>
                      Register
                    </Link>
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