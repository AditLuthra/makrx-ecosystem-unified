import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Users, Award } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface MicrositeAboutPageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeAboutPage({ params }: MicrositeAboutPageProps) {
  const { micrositeSlug } = await params;
  
  // Mock data - would fetch from database
  const microsite = {
    slug: micrositeSlug,
    title: "MakerFest 2024",
    subtitle: "The Ultimate Maker Experience",
    description: `Join thousands of makers, inventors, and technology enthusiasts for the largest maker festival on the West Coast. MakerFest 2024 brings together the brightest minds in hardware innovation, robotics, IoT, and creative technology for three days of workshops, competitions, and networking.

Our festival celebrates the spirit of making and innovation, providing a platform for creators to showcase their projects, learn new skills, and connect with like-minded individuals from across the globe.`,
    
    mission: "To inspire and empower the next generation of makers through hands-on learning, collaboration, and innovation.",
    
    highlights: [
      "50+ Interactive Workshops",
      "3 Major Competitions", 
      "100+ Vendor Marketplace",
      "Expert Keynote Speakers",
      "Networking Events",
      "Innovation Showcase"
    ],
    
    stats: [
      { label: "Expected Attendees", value: "2,000+" },
      { label: "Workshop Sessions", value: "50+" },
      { label: "Competition Categories", value: "12" },
      { label: "Industry Partners", value: "25+" }
    ],
    
    team: [
      {
        name: "Sarah Chen",
        role: "Festival Director",
        bio: "Hardware engineer turned event organizer with 10+ years in the maker community."
      },
      {
        name: "Mike Rodriguez", 
        role: "Technical Lead",
        bio: "Robotics expert and competition organizer for multiple international events."
      },
      {
        name: "Emily Watson",
        role: "Community Manager", 
        bio: "Passionate about connecting makers and fostering collaborative innovation."
      }
    ],
    
    organizer: "Bay Area Makers Guild",
    year: "2024"
  };

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
              <Link href={`/m/${micrositeSlug}/schedule`} className="text-gray-700 hover:text-primary">
                Schedule
              </Link>
              <Link href={`/m/${micrositeSlug}/about`} className="text-primary font-medium">
                About
              </Link>
              <Link href={`/m/${micrositeSlug}/sponsors`} className="text-gray-700 hover:text-primary">
                Sponsors
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{microsite.title}</h1>
          <p className="text-xl text-gray-600 mb-8">{microsite.subtitle}</p>
        </div>

        {/* Main Description */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              {microsite.description.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mission */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-6 w-6 mr-3" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 italic">"{microsite.mission}"</p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {microsite.stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Event Highlights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Event Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {microsite.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  <span className="font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Organizing Team */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Organizing Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {microsite.team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Organized by</h4>
                <p className="text-gray-600">{microsite.organizer}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Event Year</h4>
                <p className="text-gray-600">{microsite.year}</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button asChild>
                <Link href={`/m/${micrositeSlug}/register`}>
                  Register for {microsite.title}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}