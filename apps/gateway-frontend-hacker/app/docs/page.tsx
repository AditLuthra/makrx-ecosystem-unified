"use client";
import { useState } from "react";
import Link from "next/link";
import {
  BookOpen, Code, Wrench, Users, ChevronRight,
  FileText, Video, HelpCircle, Terminal, Layers, Settings
} from "lucide-react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { SEOStructuredData } from "@/components/SEOStructuredData";


interface DocItem {
  title: string;
  description: string;
  type: "guide" | "api" | "video" | "example";
  href: string;
  isExternal?: boolean;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
}

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  items: DocItem[];
  color: string;
}

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const docSections: DocSection[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Quick start guides and platform overviews",
      icon: <BookOpen className="w-6 h-6 text-makr-blue" />,
      color: "makr-blue",
      items: [
        { title: "Platform Overview", description: "Understanding the MakrX ecosystem and how all platforms work together", type: "guide", href: "/docs/overview", difficulty: "Beginner" },
        { title: "Quick Start Guide", description: "Get up and running with MakrX in 5 minutes", type: "guide", href: "/docs/quickstart", difficulty: "Beginner" },
        { title: "Account Setup", description: "Setting up your account and understanding roles", type: "guide", href: "/docs/account-setup", difficulty: "Beginner" },
        { title: "Platform Tour (Video)", description: "10-minute video walkthrough of all major features", type: "video", href: "/docs/video-tour", difficulty: "Beginner" },
      ],
    },
    {
      id: "api-reference",
      title: "API Reference",
      description: "Complete API documentation for developers",
      icon: <Code className="w-6 h-6 text-makr-yellow" />,
      color: "makr-yellow",
      items: [
        { title: "Authentication API", description: "SSO integration and token management", type: "api", href: "/docs/api/auth", difficulty: "Intermediate" },
        { title: "MakrCave API", description: "Makerspace management and booking APIs", type: "api", href: "/docs/api/makrcave", difficulty: "Intermediate" },
        { title: "Store & Orders API", description: "Product catalog and order management", type: "api", href: "/docs/api/store", difficulty: "Intermediate" },
        { title: "Webhooks", description: "Real-time event notifications", type: "api", href: "/docs/api/webhooks", difficulty: "Advanced" },
      ],
    },
    {
      id: "makerspace-guides",
      title: "Makerspace Management",
      description: "Guides for running and managing makerspaces",
      icon: <Wrench className="w-6 h-6 text-terminal-green" />,
      color: "terminal-green",
      items: [
        { title: "Setting Up Your Makerspace", description: "Complete guide to configuring MakrCave for your space", type: "guide", href: "/docs/makerspace/setup", difficulty: "Intermediate" },
        { title: "Equipment Management", description: "Adding, configuring, and maintaining equipment", type: "guide", href: "/docs/makerspace/equipment", difficulty: "Intermediate" },
        { title: "Member Onboarding", description: "Best practices for onboarding new members", type: "guide", href: "/docs/makerspace/members", difficulty: "Beginner" },
        { title: "Billing & Pricing Setup", description: "Configure pricing models and billing automation", type: "guide", href: "/docs/makerspace/billing", difficulty: "Advanced" },
      ],
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Connect MakrX with external tools and services",
      icon: <Layers className="w-6 h-6 text-purple-400" />,
      color: "purple-400",
      items: [
        { title: "Keycloak SSO Setup", description: "Integrate with existing identity providers", type: "guide", href: "/docs/integrations/sso", difficulty: "Advanced" },
        { title: "Payment Gateway Integration", description: "Configure Razorpay, Stripe, and other payment providers", type: "guide", href: "/docs/integrations/payments", difficulty: "Advanced" },
        { title: "Third-party APIs", description: "Connect with external inventory and manufacturing systems", type: "api", href: "/docs/integrations/apis", difficulty: "Advanced" },
        { title: "Slack & Discord Bots", description: "Community management and notifications", type: "guide", href: "/docs/integrations/chat", difficulty: "Intermediate" },
      ],
    },
    {
      id: "theme-system",
      title: "Theme System",
      description: "Dark mode, customization, and design system",
      icon: <Settings className="w-6 h-6 text-makr-blue" />,
      color: "makr-blue",
      items: [
        { title: "Theme Demo", description: "Interactive showcase of dark/light mode components", type: "example", href: "/theme-demo", difficulty: "Beginner" },
        { title: "Theme Implementation", description: "How to implement dark mode in your applications", type: "guide", href: "/docs/theming/implementation", difficulty: "Intermediate" },
        { title: "Design System", description: "MakrX color palette, typography, and component system", type: "guide", href: "/docs/theming/design-system", difficulty: "Beginner" },
        { title: "Custom Themes", description: "Creating and deploying custom brand themes", type: "guide", href: "/docs/theming/custom", difficulty: "Advanced" },
      ],
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "guide":
        return <FileText className="w-4 h-4" />;
      case "api":
        return <Terminal className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "example":
        return <Code className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "guide":
        return "bg-makr-blue/20 text-makr-blue border border-makr-blue/30";
      case "api":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "video":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "example":
        return "bg-terminal-green/20 text-terminal-green border border-terminal-green/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-terminal-green/20 text-terminal-green border border-terminal-green/30";
      case "Intermediate":
        return "bg-makr-yellow/20 text-makr-yellow border border-makr-yellow/30";
      case "Advanced":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const allItems = docSections.flatMap((section) =>
    section.items.map((item) => ({ ...item, sectionId: section.id, sectionTitle: section.title }))
  );

  const filteredItems = searchTerm
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      <SEOStructuredData type="website" data={{
        name: "MakrX Documentation",
        url: "https://makrx.org/docs"
      }} />
      <ThreeBackground />

      <main className="relative z-10 pt-16">
        {/* Header */}
        <section className="py-24 bg-gradient-to-br from-makr-blue/20 via-purple-600/20 to-makr-yellow/10 border-b border-makr-blue/30">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-makr-blue/20 border border-makr-blue/30 text-makr-blue text-sm font-medium mb-6 font-mono">
              <BookOpen className="w-4 h-4 mr-2" />
              Knowledge Base
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-cyberpunk mb-4 font-mono">Documentation</h1>
            <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto font-mono">
              Everything you need to know to build with MakrX — guides, API references, best practices, and examples.
            </p>
            <div className="max-w-xl mx-auto mt-8">
              <label className="sr-only" htmlFor="docs-search">Search docs</label>
              <div className="relative">
                <input
                  id="docs-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search guides, APIs, and topics..."
                  className="w-full px-4 py-3 rounded-lg bg-dark-bg-secondary border border-makr-blue/30 text-dark-text-primary placeholder-dark-text-muted focus:border-makr-yellow focus:ring-2 focus:ring-makr-yellow/30 outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Search Results */}
        {searchTerm && (
          <section className="py-12 bg-dark-bg-primary border-t border-makr-blue/30">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-2xl font-bold mb-6 text-gradient-cyberpunk font-mono">Search Results ({filteredItems.length})</h2>
              <div className="space-y-4">
                {filteredItems.map((item, index) => (
                  <Link key={index} href={item.href} className="block card-cyberpunk p-6 hover:shadow-neon-lg transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 font-mono ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                            {item.type}
                          </span>
                          {item.difficulty && (
                            <span className={`px-2 py-1 rounded text-xs font-mono ${getDifficultyColor(item.difficulty)}`}>
                              {item.difficulty}
                            </span>
                          )}
                          <span className="text-xs text-dark-text-muted font-mono">{item.sectionTitle}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1 text-gradient-cyberpunk font-mono">{item.title}</h3>
                        <p className="text-dark-text-secondary font-mono">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-makr-blue mt-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Documentation Sections */}
        {!searchTerm && (
          <section className="py-20 bg-dark-bg-primary border-t border-makr-blue/30">
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {docSections.map((section) => (
                  <div key={section.id} className="card-cyberpunk overflow-hidden border border-makr-blue/30">
                    <div className="bg-gradient-to-r from-makr-blue/10 to-makr-yellow/10 p-6 border-b border-makr-blue/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-makr-blue/10 border border-makr-blue/30 rounded-xl flex items-center justify-center shadow-neon">
                          {section.icon}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gradient-cyberpunk font-mono">{section.title}</h2>
                          <p className="text-dark-text-secondary font-mono">{section.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        {section.items.map((item, index) => (
                          <Link key={index} href={item.href} className="block p-4 rounded-lg border border-makr-blue/20 hover:border-makr-blue/40 hover:bg-makr-blue/5 transition-all group">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 font-mono ${getTypeColor(item.type)}`}>
                                    {getTypeIcon(item.type)}
                                    {item.type}
                                  </span>
                                  {item.difficulty && (
                                    <span className={`px-2 py-1 rounded text-xs font-mono ${getDifficultyColor(item.difficulty)}`}>
                                      {item.difficulty}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-semibold mb-1 text-gradient-cyberpunk font-mono">{item.title}</h3>
                                <p className="text-sm text-dark-text-secondary font-mono">{item.description}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-makr-blue group-hover:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Help Section */}
        <section className="py-20 bg-gradient-to-r from-makr-blue/20 to-purple-600/20 border-t border-makr-blue/30">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gradient-cyberpunk font-mono">Need Help?</h2>
            <p className="mb-6 text-dark-text-secondary font-mono">
              Can't find what you're looking for? Our community and support team are here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-cyberpunk px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 font-mono inline-flex items-center justify-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Contact Support
              </Link>
              <a
                href="https://community.makrx.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-transparent border-2 border-makr-blue/50 text-makr-blue hover:bg-makr-blue/10 hover:border-makr-blue transition-all font-mono gap-2"
              >
                <Users className="w-4 h-4" />
                Join Community
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
