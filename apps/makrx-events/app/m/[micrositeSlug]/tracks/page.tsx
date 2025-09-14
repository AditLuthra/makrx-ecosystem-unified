import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cpu, Zap, Wrench, Palette, Code, Bot } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface MicrositeTracksPageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeTracksPage({ params }: MicrositeTracksPageProps) {
  const { micrositeSlug } = await params;
  
  // Mock data - would fetch from database
  const microsite = {
    slug: micrositeSlug,
    title: "MakerFest 2024"
  };

  const tracks = [
    {
      id: "robotics",
      name: "Robotics & Automation",
      icon: Bot,
      color: "bg-blue-500",
      description: "Build, program, and compete with autonomous robots and automated systems.",
      events: 8,
      competitions: 2,
      workshops: 6,
      featured: [
        "Autonomous Robot Competition",
        "Arduino Robotics Workshop", 
        "Industrial Automation Showcase"
      ],
      skills: ["Arduino Programming", "Sensor Integration", "Motor Control", "AI/ML"],
      difficulty: "Intermediate to Advanced"
    },
    {
      id: "iot", 
      name: "IoT & Smart Devices",
      icon: Cpu,
      color: "bg-green-500",
      description: "Connected devices, sensors, and smart home/city technologies.",
      events: 6,
      competitions: 1,
      workshops: 5,
      featured: [
        "Smart Cities Hackathon",
        "IoT Sensor Networks Workshop",
        "Connected Home Devices"
      ],
      skills: ["Raspberry Pi", "Cloud Integration", "Wireless Protocols", "Data Analytics"],
      difficulty: "Beginner to Intermediate"
    },
    {
      id: "manufacturing",
      name: "Digital Manufacturing",
      icon: Wrench,
      color: "bg-orange-500", 
      description: "3D printing, CNC machining, laser cutting, and modern fabrication techniques.",
      events: 7,
      competitions: 1,
      workshops: 6,
      featured: [
        "3D Printing Mastery Workshop",
        "CNC Design Challenge",
        "Laser Cutting Precision"
      ],
      skills: ["CAD Design", "3D Printing", "CNC Programming", "Materials Science"],
      difficulty: "Beginner to Advanced"
    },
    {
      id: "electronics",
      name: "Electronics & PCB Design", 
      icon: Zap,
      color: "bg-purple-500",
      description: "Circuit design, PCB layout, and electronic prototyping for makers.",
      events: 5,
      competitions: 1,
      workshops: 4,
      featured: [
        "PCB Design Workshop",
        "Electronic Music Instruments",
        "Power Electronics Fundamentals"
      ],
      skills: ["Circuit Design", "PCB Layout", "Soldering", "Embedded Programming"],
      difficulty: "Intermediate to Advanced"
    },
    {
      id: "software",
      name: "Software & Programming",
      icon: Code,
      color: "bg-indigo-500",
      description: "Programming for makers, embedded systems, and maker-focused software development.",
      events: 6,
      competitions: 2,
      workshops: 4,
      featured: [
        "Embedded C++ Workshop",
        "Maker App Development",
        "Open Source Hardware Tools"
      ],
      skills: ["Python", "C/C++", "JavaScript", "Embedded Programming"],
      difficulty: "Beginner to Advanced"
    },
    {
      id: "creative",
      name: "Creative Making & Art",
      icon: Palette,
      color: "bg-pink-500",
      description: "Interactive art, creative coding, and artistic applications of maker technologies.",
      events: 4,
      competitions: 1,
      workshops: 3,
      featured: [
        "Interactive Art Installation",
        "LED Art Workshop",
        "Creative Coding with Processing"
      ],
      skills: ["Creative Coding", "Interactive Design", "Digital Art", "Performance Tech"],
      difficulty: "Beginner to Intermediate"
    }
  ];

  if (!microsite) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Microsite Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href={`/m/${micrositeSlug}`} className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {microsite.title}
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href={`/m/${micrositeSlug}/events`} className="text-gray-700 hover:text-primary">
                Events
              </Link>
              <Link href={`/m/${micrositeSlug}/tracks`} className="text-primary font-medium">
                Tracks
              </Link>
              <Link href={`/m/${micrositeSlug}/speakers`} className="text-gray-700 hover:text-primary">
                Speakers
              </Link>
              <Link href={`/m/${micrositeSlug}/venue`} className="text-gray-700 hover:text-primary">
                Venue
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Tracks</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore specialized tracks designed for different interests and skill levels in the maker community.
          </p>
        </div>

        {/* Track Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">Specialized Tracks</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600">36</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-600">Competitions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-600">28</div>
              <div className="text-sm text-gray-600">Workshops</div>
            </CardContent>
          </Card>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tracks.map((track) => (
            <Card key={track.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${track.color} mr-4`}>
                      <track.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{track.name}</CardTitle>
                      <div className="flex space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {track.events} events
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {track.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{track.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Event Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{track.competitions}</div>
                    <div className="text-xs text-blue-800">Competitions</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{track.workshops}</div>
                    <div className="text-xs text-green-800">Workshops</div>
                  </div>
                </div>

                {/* Featured Events */}
                <div>
                  <h4 className="font-semibold mb-2">Featured Events</h4>
                  <ul className="space-y-1">
                    {track.featured.map((event, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-semibold mb-2">Key Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {track.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <Button asChild className="w-full">
                    <Link href={`/m/${micrositeSlug}/events?track=${track.id}`}>
                      View {track.name} Events
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Track Selection Guide */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-none">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-center mb-6">Choose Your Track</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-lg font-semibold mb-2">🚀 Beginner</div>
                <p className="text-sm text-gray-600 mb-3">
                  New to making? Start with IoT, Creative Making, or basic Manufacturing workshops.
                </p>
                <Badge variant="outline">IoT • Creative • Manufacturing</Badge>
              </div>
              <div>
                <div className="text-lg font-semibold mb-2">⚡ Intermediate</div>
                <p className="text-sm text-gray-600 mb-3">
                  Have some experience? Try Robotics, Electronics, or advanced Software projects.
                </p>
                <Badge variant="outline">Robotics • Electronics • Software</Badge>
              </div>
              <div>
                <div className="text-lg font-semibold mb-2">🏆 Advanced</div>
                <p className="text-sm text-gray-600 mb-3">
                  Ready for challenges? Join competitions in any track or tackle complex projects.
                </p>
                <Badge variant="outline">All Competitions • Advanced Workshops</Badge>
              </div>
            </div>
            <div className="text-center mt-6">
              <Button asChild>
                <Link href={`/m/${micrositeSlug}/events`}>
                  Explore All Events
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}