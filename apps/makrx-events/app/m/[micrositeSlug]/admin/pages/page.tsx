import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  GripVertical,
  Save
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface MicrositePageEditorProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositePageEditor({ params }: MicrositePageEditorProps) {
  const { micrositeSlug } = await params;
  
  // Mock data - would fetch from database
  const microsite = {
    slug: micrositeSlug,
    title: "MakerFest 2024"
  };

  const pageSections = [
    {
      id: "1",
      type: "hero",
      title: "Hero Section",
      order: 1,
      isVisible: true,
      content: {
        title: "MakerFest 2024",
        subtitle: "The Ultimate Maker Experience",
        backgroundImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        ctaText: "Register Now",
        ctaUrl: `/m/${micrositeSlug}/register`
      }
    },
    {
      id: "2", 
      type: "about",
      title: "About Section",
      order: 2,
      isVisible: true,
      content: {
        title: "About MakerFest 2024",
        description: "Join thousands of makers, inventors, and technology enthusiasts for the largest maker festival on the West Coast.",
        features: ["50+ Interactive Workshops", "3 Major Competitions", "100+ Vendor Marketplace"]
      }
    },
    {
      id: "3",
      type: "schedule",
      title: "Schedule Overview",
      order: 3,
      isVisible: true,
      content: {
        title: "Event Schedule",
        showFullSchedule: true
      }
    },
    {
      id: "4",
      type: "sponsors",
      title: "Sponsors",
      order: 4,
      isVisible: false,
      content: {
        title: "Our Partners",
        tiers: ["Title", "Gold", "Silver", "Bronze"]
      }
    }
  ];

  const availableSectionTypes = [
    { type: "hero", name: "Hero Banner", description: "Main banner with title and call-to-action" },
    { type: "about", name: "About Section", description: "Information about the event" },
    { type: "schedule", name: "Schedule", description: "Event timeline and schedule" },
    { type: "sponsors", name: "Sponsors", description: "Sponsor logos and information" },
    { type: "faq", name: "FAQ", description: "Frequently asked questions" },
    { type: "venue", name: "Venue Info", description: "Location and venue details" },
    { type: "speakers", name: "Speakers", description: "Featured speakers and judges" },
    { type: "tracks", name: "Event Tracks", description: "Competition and workshop categories" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href={`/m/${micrositeSlug}/admin`} className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Edit className="inline h-8 w-8 mr-3" />
            Page Content Editor
          </h1>
          <p className="text-gray-600">
            Manage the sections and content of your microsite
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Sections */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Page Sections</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>

            <div className="space-y-4">
              {pageSections.map((section) => (
                <Card key={section.id} className={`${!section.isVisible ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <CardDescription>Order: {section.order}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={section.isVisible} />
                        <Button variant="ghost" size="sm">
                          {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.type === "hero" && (
                        <>
                          <div>
                            <Label htmlFor="hero-title">Title</Label>
                            <Input 
                              id="hero-title" 
                              defaultValue={section.content.title}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="hero-subtitle">Subtitle</Label>
                            <Input 
                              id="hero-subtitle" 
                              defaultValue={section.content.subtitle}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="hero-cta">Call-to-Action Text</Label>
                            <Input 
                              id="hero-cta" 
                              defaultValue={section.content.ctaText}
                              className="mt-1"
                            />
                          </div>
                        </>
                      )}
                      
                      {section.type === "about" && (
                        <>
                          <div>
                            <Label htmlFor="about-title">Title</Label>
                            <Input 
                              id="about-title" 
                              defaultValue={section.content.title}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="about-description">Description</Label>
                            <Textarea 
                              id="about-description" 
                              defaultValue={section.content.description}
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Features (one per line)</Label>
                            <Textarea 
                              defaultValue={section.content.features?.join('\n')}
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                        </>
                      )}

                      {section.type === "sponsors" && (
                        <div>
                          <Label>Sponsor Tiers</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {section.content.tiers?.map((tier, index) => (
                              <Input key={index} defaultValue={tier} placeholder={`Tier ${index + 1}`} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Section Library */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Sections</CardTitle>
                <CardDescription>Drag or click to add to your page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableSectionTypes.map((sectionType) => (
                  <div 
                    key={sectionType.type} 
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="font-medium text-sm">{sectionType.name}</div>
                    <div className="text-xs text-gray-600">{sectionType.description}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save">Auto-save</Label>
                  <Switch id="auto-save" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-preview">Live Preview</Label>
                  <Switch id="show-preview" />
                </div>
                <div className="pt-2">
                  <Button className="w-full" variant="outline">
                    Reset to Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}