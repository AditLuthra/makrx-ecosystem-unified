import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import { Calendar, MapPin, Users, Wrench, Clock, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function WorkshopsPage() {
  const workshops = [
    {
      id: "3d-printing-workshop",
      title: "3D Printing Workshop",
      description: "Comprehensive hands-on workshop covering 3D modeling with Fusion 360, printing techniques, material selection, and post-processing for makers of all levels.",
      date: "May 5, 2024",
      location: "Austin, TX",
      attendees: 50,
      duration: "6 hours",
      price: "$120",
      instructor: "Sarah Chen",
      image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      tags: ["3D Printing", "CAD", "Prototyping"],
      level: "Beginner-Intermediate",
      includes: ["Materials", "Software License", "Take-home Print"]
    },
    {
      id: "arduino-electronics",
      title: "Arduino & Electronics Basics",
      description: "Learn electronics fundamentals and Arduino programming. Build circuits, sensors, and interactive projects from scratch with guided instruction.",
      date: "March 15, 2024",
      location: "San Francisco, CA (Part of Maker Fest)",
      attendees: 75,
      duration: "4 hours",
      price: "$85",
      instructor: "Mike Rodriguez",
      image: "https://images.unsplash.com/photo-1553835973-dec43bcddbeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["Arduino", "Electronics", "Programming"],
      level: "Beginner",
      includes: ["Arduino Kit", "Components", "Code Examples"]
    },
    {
      id: "laser-cutting-design",
      title: "Laser Cutting & Design",
      description: "Master laser cutting techniques and parametric design. Create custom enclosures, decorative items, and functional parts using professional tools.",
      date: "April 12, 2024",
      location: "Seattle, WA",
      attendees: 30,
      duration: "5 hours",
      price: "$150",
      instructor: "Emma Thompson",
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["Laser Cutting", "Design", "Fabrication"],
      level: "Intermediate",
      includes: ["Materials", "Design Software", "Multiple Projects"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <Wrench className="inline h-8 w-8 mr-2 text-blue-500" />
            Workshops
          </h1>
          <p className="text-lg text-gray-600">
            Hands-on learning experiences with expert instructors. Build skills, create projects, and learn new technologies in small group settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <Card key={workshop.id} className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={workshop.image}
                  alt={workshop.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800"
                  >
                    Workshop
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge 
                    className={`${
                      workshop.level.includes('Beginner') ? 'bg-green-500' :
                      workshop.level.includes('Intermediate') ? 'bg-yellow-500' :
                      'bg-red-500'
                    } text-white`}
                  >
                    {workshop.level}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  {workshop.title}
                  <GraduationCap className="h-5 w-5 ml-2 text-blue-500" />
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {workshop.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-blue-800 mb-1">Price</div>
                      <div className="text-lg font-bold text-blue-900">{workshop.price}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-800 mb-1">Duration</div>
                      <div className="text-sm text-blue-900">{workshop.duration}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {workshop.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {workshop.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {workshop.attendees} max participants
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Instructor: {workshop.instructor}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {workshop.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Includes:</h4>
                  <div className="text-xs text-gray-600">
                    {workshop.includes.join(", ")}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/events/${workshop.id}`}>
                      Learn More
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="default" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Link href={`/events/${workshop.id}/register`}>
                      Enroll
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