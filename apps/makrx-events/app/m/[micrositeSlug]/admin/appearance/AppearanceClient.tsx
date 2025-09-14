'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Palette, Eye, Save } from "lucide-react";
import Link from "next/link";
import ThemeEditor from "@/components/microsites/ThemeEditor";
import TemplateSelector from "@/components/microsites/TemplateSelector";

interface AppearanceClientProps {
  micrositeSlug: string;
}

export default function AppearanceClient({ micrositeSlug }: AppearanceClientProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('festival-classic');
  const [currentTheme, setCurrentTheme] = useState({
    id: 'theme_1',
    name: 'Festival Classic - Blue',
    templateId: 'festival-classic',
    tokens: {
      primary: '#3B82F6',
      accent: '#8B5CF6',
      background: '#FFFFFF',
      foreground: '#1F2937',
      muted: '#F3F4F6',
      mutedForeground: '#6B7280',
      border: '#E5E7EB',
      radius: '0.5rem',
      fontHeading: 'Inter',
      fontBody: 'Inter'
    },
    assets: {
      logoUrl: '',
      heroUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      faviconUrl: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // TODO: Update theme based on template
  };

  const handleThemeChange = (updatedTheme: any) => {
    setCurrentTheme(updatedTheme);
  };

  const handleSaveTheme = async (theme: any) => {
    setIsLoading(true);
    try {
      // TODO: Save theme to database
      // Save theme to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock save
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
                Preview Changes
              </Button>
              <Button size="sm" onClick={() => handleSaveTheme(currentTheme)} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Appearance'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Palette className="inline h-8 w-8 mr-3" />
            Appearance Settings
          </h1>
          <p className="text-gray-600">
            Customize the look and feel of your microsite
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-2 space-y-6">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleTemplateSelect}
              onPreviewTemplate={(templateId) => console.log('Preview template:', templateId)}
            />
          </div>

          {/* Live Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your changes look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="h-12 flex items-center px-4"
                    style={{ backgroundColor: currentTheme.tokens.primary }}
                  >
                    <div className="w-8 h-8 bg-white/20 rounded mr-3"></div>
                    <span className="text-white font-semibold">MakerFest 2024</span>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <div 
                      className="h-16 rounded mb-4"
                      style={{ backgroundColor: currentTheme.tokens.accent + '20' }}
                    ></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div 
                      className="inline-block px-3 py-1 rounded text-white text-sm mt-4"
                      style={{ backgroundColor: currentTheme.tokens.primary }}
                    >
                      Register Now
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Open Full Preview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Theme Editor */}
        <div className="mt-8">
          <ThemeEditor
            theme={currentTheme}
            onThemeChange={handleThemeChange}
            onSave={handleSaveTheme}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}