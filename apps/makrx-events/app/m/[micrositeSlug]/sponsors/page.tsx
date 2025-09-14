import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface MicrositeSponsorsPageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeSponsorsPage({ params }: MicrositeSponsorsPageProps) {
  const { micrositeSlug } = await params;
  
  // Mock data - would fetch from database
  const microsite = {
    slug: micrositeSlug,
    title: "MakerFest 2024"
  };

  const sponsorTiers = [
    {
      tier: "Title",
      color: "bg-purple-600",
      sponsors: [
        {
          name: "TechCorp Industries",
          description: "Leading manufacturer of development boards and maker tools",
          website: "https://techcorp.com",
          contribution: "Main venue sponsor and hardware partner"
        }
      ]
    },
    {
      tier: "Gold",
      color: "bg-yellow-500",
      sponsors: [
        {
          name: "InnovateNow",
          description: "Venture capital firm focused on hardware startups",
          website: "https://innovatenow.vc",
          contribution: "Competition prize sponsor"
        },
        {
          name: "MakerSpace Pro",
          description: "Professional makerspace and prototyping services",
          website: "https://makerspacepro.com",
          contribution: "Workshop equipment and materials"
        }
      ]
    },
    {
      tier: "Silver",
      color: "bg-gray-400",
      sponsors: [
        {
          name: "CircuitFlow",
          description: "PCB design and manufacturing platform",
          website: "https://circuitflow.com",
          contribution: "PCB manufacturing for competitions"
        },
        {
          name: "RoboTech Solutions",
          description: "Robotics components and educational kits",
          website: "https://robotechsolutions.com",
          contribution: "Robotics workshop materials"
        },
        {
          name: "3D Print World",
          description: "3D printing services and filament supplier",
          website: "https://3dprintworld.com",
          contribution: "3D printing materials and services"
        }
      ]
    },
    {
      tier: "Bronze",
      color: "bg-orange-600",
      sponsors: [
        {
          name: "Code Academy",
          description: "Online programming education platform",
          website: "https://codeacademy.com",
          contribution: "Educational resources"
        },
        {
          name: "Hardware Hub",
          description: "Electronic components distributor",
          website: "https://hardwarehub.com",
          contribution: "Component kits for participants"
        }
      ]
    }
  ];

  const sponsorshipPackages = [
    {
      tier: "Title Sponsor",
      price: "$25,000+",
      benefits: [
        "Event naming rights",
        "Logo on all marketing materials",
        "Prime booth location",
        "Speaking opportunity",
        "VIP event access",
        "Social media promotion"
      ]
    },
    {
      tier: "Gold Sponsor", 
      price: "$10,000+",
      benefits: [
        "Prominent logo placement",
        "Dedicated booth space",
        "Workshop sponsorship",
        "Access to attendee networking",
        "Social media mentions"
      ]
    },
    {
      tier: "Silver Sponsor",
      price: "$5,000+", 
      benefits: [
        "Logo on website and signage",
        "Standard booth space",
        "Networking event access",
        "Social media mentions"
      ]
    },
    {
      tier: "Bronze Sponsor",
      price: "$2,500+",
      benefits: [
        "Logo on website",
        "Promotional materials distribution",
        "Event attendance"
      ]
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
              <Link href={`/m/${micrositeSlug}/schedule`} className="text-gray-700 hover:text-primary">
                Schedule
              </Link>
              <Link href={`/m/${micrositeSlug}/about`} className="text-gray-700 hover:text-primary">
                About
              </Link>
              <Link href={`/m/${micrositeSlug}/sponsors`} className="text-primary font-medium">
                Sponsors
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Sponsors & Partners</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're grateful for the support of these amazing organizations that make {microsite.title} possible.
          </p>
        </div>

        {/* Current Sponsors */}
        <div className="space-y-12 mb-16">
          {sponsorTiers.map((tierGroup) => (
            <div key={tierGroup.tier}>
              <div className="flex items-center justify-center mb-8">
                <Badge className={`${tierGroup.color} text-white text-lg px-4 py-2`}>
                  {tierGroup.tier} Sponsors
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tierGroup.sponsors.map((sponsor, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        {/* Logo placeholder */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-500">
                            {sponsor.name.substring(0, 2)}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                      <CardTitle className="text-lg">{sponsor.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{sponsor.description}</p>
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Contribution</div>
                        <div className="text-sm">{sponsor.contribution}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sponsorship Opportunities */}
        <div className="border-t pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Become a Sponsor</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Partner with us to support the maker community and showcase your brand to thousands of innovators and creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {sponsorshipPackages.map((package_, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-xl text-center">{package_.tier}</CardTitle>
                  <div className="text-2xl font-bold text-center text-primary">{package_.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {package_.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Interested in Sponsoring?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Contact our partnerships team to discuss custom sponsorship opportunities and how we can help you connect with the maker community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="mailto:sponsors@makerfest.com">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Partnerships Team
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/sponsor-kit.pdf" target="_blank">
                    Download Sponsor Kit
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}