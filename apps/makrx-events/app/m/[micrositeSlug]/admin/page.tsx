import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Edit, 
  Eye, 
  BarChart3, 
  Users, 
  Calendar, 
  Ticket, 
  Palette,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface MicrositeAdminPageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeAdminPage({ params }: MicrositeAdminPageProps) {
  const { micrositeSlug } = await params;
  
  // Mock microsite data - in real app this would fetch from database
  const microsite = {
    slug: micrositeSlug,
    title: "MakerFest 2024",
    status: "published",
    startsAt: "March 15, 2024",
    endsAt: "March 17, 2024",
    totalRegistrations: 156,
    totalRevenue: "$4,200",
    publishedEvents: 5,
    draftEvents: 2
  };

  if (!microsite) {
    notFound();
  }

  const adminSections = [
    {
      title: "Overview",
      description: "Microsite analytics and quick stats",
      icon: BarChart3,
      href: `/m/${micrositeSlug}/admin`,
      badge: "Current",
      stats: [
        { label: "Total Registrations", value: microsite.totalRegistrations },
        { label: "Revenue", value: microsite.totalRevenue },
        { label: "Published Events", value: microsite.publishedEvents }
      ]
    },
    {
      title: "Appearance",
      description: "Customize theme, colors, and layout",
      icon: Palette,
      href: `/m/${micrositeSlug}/admin/appearance`,
      badge: null
    },
    {
      title: "Pages & Content",
      description: "Manage sections and page content",
      icon: Edit,
      href: `/m/${micrositeSlug}/admin/pages`,
      badge: null
    },
    {
      title: "Sub-Events",
      description: "Create and manage competitions, workshops",
      icon: Calendar,
      href: `/m/${micrositeSlug}/admin/events`,
      badge: `${microsite.draftEvents} drafts`
    },
    {
      title: "Ticketing",
      description: "Ticket tiers, pricing, and coupons",
      icon: Ticket,
      href: `/m/${micrositeSlug}/admin/tickets`,
      badge: null
    },
    {
      title: "Registrations",
      description: "Manage attendees and check-ins",
      icon: Users,
      href: `/m/${micrositeSlug}/admin/registrations`,
      badge: `${microsite.totalRegistrations} registered`
    },
    {
      title: "Analytics",
      description: "Detailed stats and reporting",
      icon: BarChart3,
      href: `/m/${micrositeSlug}/admin/analytics`,
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href={`/m/${micrositeSlug}`} className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {microsite.title}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={microsite.status === 'published' ? 'default' : 'secondary'}>
                {microsite.status}
              </Badge>
              <Button asChild variant="outline" size="sm">
                <Link href={`/m/${micrositeSlug}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Settings className="inline h-8 w-8 mr-3" />
            Admin: {microsite.title}
          </h1>
          <p className="text-gray-600">
            Manage your microsite content, events, and settings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{microsite.totalRegistrations}</div>
              <div className="text-sm text-gray-600">Total Registrations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{microsite.totalRevenue}</div>
              <div className="text-sm text-gray-600">Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{microsite.publishedEvents}</div>
              <div className="text-sm text-gray-600">Published Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">{microsite.draftEvents}</div>
              <div className="text-sm text-gray-600">Draft Events</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Card key={section.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={section.href}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <section.icon className="h-6 w-6 mr-3 text-primary" />
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                    {section.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                {section.stats && (
                  <CardContent>
                    <div className="space-y-2">
                      {section.stats.map((stat, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{stat.label}:</span>
                          <span className="font-medium">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Link>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href={`/m/${micrositeSlug}/admin/events/new`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Add Sub-Event
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/m/${micrositeSlug}/admin/pages`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Content
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/m/${micrositeSlug}/admin/registrations`}>
                  <Users className="h-4 w-4 mr-2" />
                  View Registrations
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/m/${micrositeSlug}/admin/analytics`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}