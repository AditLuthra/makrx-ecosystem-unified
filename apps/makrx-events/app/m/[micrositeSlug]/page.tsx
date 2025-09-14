import SectionRenderer from "@/components/microsites/SectionRenderer";
import { Button } from "@/components/ui/button";
import { Settings, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface MicrositePageProps {
  params: {
    micrositeSlug: string;
  };
}

// Mock microsite data
const getMicrositeData = (slug: string) => {
  const microsites = {
    "makerfest-2024": {
      slug: "makerfest-2024",
      title: "MakerFest 2024",
      subtitle: "The Ultimate Maker Experience",
      description: "Join thousands of makers, inventors, and technology enthusiasts for the largest maker festival on the West Coast.",
      startsAt: "March 15, 2024",
      endsAt: "March 17, 2024",
      location: "Moscone Center, San Francisco",
      heroImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3",
      theme: {
        primary: "#8B5CF6",
        accent: "#F59E0B",
        background: "#F8FAFC"
      },
      highlights: [
        "50+ Interactive Workshops",
        "3 Major Competitions",
        "100+ Vendor Marketplace",
        "Expert Keynote Speakers",
        "Networking Events"
      ],
      subEvents: [
        {
          slug: "robotics-championship",
          title: "Robotics Championship",
          type: "competition",
          date: "March 16, 2024",
          time: "10:00 AM - 6:00 PM",
          prize: "$10,000",
          participants: 150
        },
        {
          slug: "3d-printing-workshop",
          title: "3D Printing Mastery",
          type: "workshop",
          date: "March 15, 2024",
          time: "2:00 PM - 5:00 PM",
          price: "Included",
          capacity: 50
        },
        {
          slug: "iot-hackathon",
          title: "IoT Smart Cities Hackathon",
          type: "competition",
          date: "March 16-17, 2024",
          time: "24 hours",
          prize: "$15,000",
          participants: 200
        }
      ],
      sponsors: [
        { name: "TechCorp", tier: "Title", logo: "/sponsors/techcorp.svg" },
        { name: "InnovateNow", tier: "Gold", logo: "/sponsors/innovate.svg" }
      ],
      organizer: "Bay Area Makers Guild",
      website: "https://bayareamakers.org"
    }
  };
  
  return microsites[slug as keyof typeof microsites] || null;
};

export default async function MicrositePage({ params }: MicrositePageProps) {
  const { micrositeSlug } = await params;
  const microsite = getMicrositeData(micrositeSlug);
  
  if (!microsite) {
    notFound();
  }

  // Mock sections data for the SectionRenderer
  const sections = [
    {
      id: "1",
      type: "hero",
      order: 1,
      isVisible: true,
      contentJson: {
        title: microsite.title,
        subtitle: microsite.subtitle,
        description: microsite.description,
        backgroundImage: microsite.heroImage,
        ctaText: "Register Now",
        ctaUrl: `/m/${micrositeSlug}/register`,
        startDate: microsite.startsAt,
        endDate: microsite.endsAt,
        location: microsite.location
      }
    },
    {
      id: "2",
      type: "about",
      order: 2,
      isVisible: true,
      contentJson: {
        title: `About ${microsite.title}`,
        description: `${microsite.description}\n\nOur festival celebrates the spirit of making and innovation, providing a platform for creators to showcase their projects, learn new skills, and connect with like-minded individuals from across the globe.`,
        features: microsite.highlights,
        stats: [
          { label: "Expected Attendees", value: "2,000+" },
          { label: "Workshop Sessions", value: "50+" },
          { label: "Competition Categories", value: "12" },
          { label: "Industry Partners", value: "25+" }
        ]
      }
    },
    {
      id: "3",
      type: "schedule",
      order: 3,
      isVisible: true,
      contentJson: {
        title: "Event Highlights",
        showFullSchedule: true
      }
    },
    {
      id: "4",
      type: "sponsors",
      order: 4,
      isVisible: true,
      contentJson: {
        title: "Our Partners",
        tiers: ["Gold", "Silver", "Bronze"]
      }
    }
  ];

  // Mock user authentication check - would be real in production
  const isAuthenticated = false;
  const isOrganizer = false; // microsite.organizerId === currentUser?.id

  return (
    <>
      {/* SEO Meta Tags - would be in Head component */}
      <title>{`${microsite.title} - ${microsite.subtitle}`}</title>
      <meta name="description" content={microsite.description} />

      <div className="min-h-screen bg-background">
        {/* Admin Bar (only visible to organizers) */}
        {isOrganizer && (
          <div className="bg-black text-white px-4 py-2 flex justify-between items-center">
            <span className="text-sm">
              ⚡ Admin Mode: {microsite.title}
            </span>
            <div className="flex space-x-2">
              <Button size="sm" variant="secondary" asChild>
                <Link href={`/m/${micrositeSlug}/admin`}>
                  <Settings className="h-4 w-4 mr-1" />
                  Admin Panel
                </Link>
              </Button>
              <Button size="sm" variant="secondary" asChild>
                <a href={`/m/${micrositeSlug}`} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Preview
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 mr-4">
                  ← Back to MakrX.events
                </Link>
                <div className="h-6 w-px bg-gray-300 mr-4"></div>
                <Link href={`/m/${micrositeSlug}`} className="text-xl font-bold text-primary">
                  {microsite.title}
                </Link>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href={`/m/${micrositeSlug}/events`} className="text-gray-700 hover:text-primary">
                  Events
                </Link>
                <Link href={`/m/${micrositeSlug}/schedule`} className="text-gray-700 hover:text-primary">
                  Schedule
                </Link>
                <Link href={`/m/${micrositeSlug}/speakers`} className="text-gray-700 hover:text-primary">
                  Speakers
                </Link>
                <Link href={`/m/${micrositeSlug}/about`} className="text-gray-700 hover:text-primary">
                  About
                </Link>
                <Link href={`/m/${micrositeSlug}/sponsors`} className="text-gray-700 hover:text-primary">
                  Sponsors
                </Link>
                <Link href={`/m/${micrositeSlug}/faq`} className="text-gray-700 hover:text-primary">
                  FAQ
                </Link>
              </nav>
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <Link href="/auth/login">Login</Link>
                  </Button>
                )}
                <Button asChild>
                  <Link href={`/m/${micrositeSlug}/register`}>Register</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Rendered Sections */}
        <main>
          <SectionRenderer 
            sections={sections} 
            micrositeSlug={micrositeSlug}
          />
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">{microsite.title}</h3>
                <p className="text-gray-400 text-sm">
                  {microsite.description}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href={`/m/${micrositeSlug}/events`} className="text-gray-400 hover:text-white">Events</Link></li>
                  <li><Link href={`/m/${micrositeSlug}/schedule`} className="text-gray-400 hover:text-white">Schedule</Link></li>
                  <li><Link href={`/m/${micrositeSlug}/speakers`} className="text-gray-400 hover:text-white">Speakers</Link></li>
                  <li><Link href={`/m/${micrositeSlug}/venue`} className="text-gray-400 hover:text-white">Venue</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href={`/m/${micrositeSlug}/faq`} className="text-gray-400 hover:text-white">FAQ</Link></li>
                  <li><Link href={`/m/${micrositeSlug}/contact`} className="text-gray-400 hover:text-white">Contact</Link></li>
                  <li><Link href="/support" className="text-gray-400 hover:text-white">Help Center</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-white">Twitter</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">LinkedIn</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Discord</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2024 {microsite.title}. All rights reserved. Powered by MakrX.events</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}