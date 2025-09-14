'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, Users } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: {
    thumbnail: string;
    features: string[];
  };
  defaultSections: Array<{
    type: string;
    order: number;
    required: boolean;
  }>;
  allowedSections: string[];
  themeTokens: {
    colorScheme: string;
    typography: string;
    layout: string;
    components: string;
  };
  settings: {
    enableTracks: boolean;
    enableSpeakers: boolean;
    enableSponsors: boolean;
    enableSchedule: boolean;
    headerStyle: string;
    navigationStyle: string;
  };
  usageCount: number;
  isActive: boolean;
}

interface TemplateSelectorProps {
  selectedTemplate?: string;
  onSelectTemplate: (templateId: string) => void;
  onPreviewTemplate?: (templateId: string) => void;
}

export default function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
  onPreviewTemplate,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(templates.map((t) => t.category)))];
  const filteredTemplates =
    activeCategory === 'all' ? templates : templates.filter((t) => t.category === activeCategory);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Choose a Template</h3>
        <p className="text-sm text-muted-foreground">
          Select a template that best fits your event type and style
        </p>
      </div>

      {/* Category Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeCategory === category
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            {/* Template Preview */}
            <div className="relative">
              <img
                src={template.preview.thumbnail}
                alt={`${template.name} preview`}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewTemplate?.(template.id);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>

              {/* Selection Indicator */}
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {/* Usage Count */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-black/50 text-white border-0">
                  <Users className="h-3 w-3 mr-1" />
                  {template.usageCount}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
              </div>
              <CardDescription className="text-sm">{template.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div>
                <h4 className="text-sm font-medium mb-2">Key Features</h4>
                <div className="space-y-1">
                  {template.preview.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center">
                      <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                  {template.preview.features.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{template.preview.features.length - 3} more features
                    </div>
                  )}
                </div>
              </div>

              {/* Template Style Tags */}
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {template.themeTokens.colorScheme}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {template.themeTokens.layout}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {template.themeTokens.typography}
                </Badge>
              </div>

              {/* Action Button */}
              <Button
                className="w-full mt-4"
                variant={selectedTemplate === template.id ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template.id);
                }}
              >
                {selectedTemplate === template.id ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Selected
                  </>
                ) : (
                  'Select Template'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">No templates found in this category.</div>
        </div>
      )}
    </div>
  );
}
