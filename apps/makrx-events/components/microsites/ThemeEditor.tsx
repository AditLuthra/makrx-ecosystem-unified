'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Palette, Type, Layout, Image, Download, Undo2 } from 'lucide-react';

interface ThemeTokens {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  radius: string;
  fontHeading: string;
  fontBody: string;
}

interface ThemeAssets {
  logoUrl?: string;
  heroUrl?: string;
  faviconUrl?: string;
}

interface Theme {
  id: string;
  name: string;
  templateId: string;
  tokens: ThemeTokens;
  assets: ThemeAssets;
}

interface ThemeEditorProps {
  theme: Theme;
  onThemeChange: (updatedTheme: Theme) => void;
  onSave: (theme: Theme) => void;
  isLoading?: boolean;
}

const presetColors = {
  blues: ['#3B82F6', '#1D4ED8', '#2563EB', '#1E40AF'],
  purples: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
  greens: ['#10B981', '#059669', '#047857', '#065F46'],
  reds: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'],
  oranges: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
  grays: ['#6B7280', '#4B5563', '#374151', '#1F2937']
};

const fontOptions = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Playfair Display', 'Merriweather', 'Oswald', 'Source Sans Pro',
  'Nunito', 'Poppins', 'Raleway', 'Orbitron', 'Fira Code'
];

export default function ThemeEditor({ theme, onThemeChange, onSave, isLoading }: ThemeEditorProps) {
  const [activeSection, setActiveSection] = useState('colors');
  const [localTheme, setLocalTheme] = useState<Theme>(theme);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const updateTokens = (updates: Partial<ThemeTokens>) => {
    const updatedTheme = {
      ...localTheme,
      tokens: { ...localTheme.tokens, ...updates }
    };
    setLocalTheme(updatedTheme);
    setHasChanges(true);
    onThemeChange(updatedTheme);
  };

  const updateAssets = (updates: Partial<ThemeAssets>) => {
    const updatedTheme = {
      ...localTheme,
      assets: { ...localTheme.assets, ...updates }
    };
    setLocalTheme(updatedTheme);
    setHasChanges(true);
    onThemeChange(updatedTheme);
  };

  const resetToOriginal = () => {
    setLocalTheme(theme);
    setHasChanges(false);
    onThemeChange(theme);
  };

  const handleSave = () => {
    onSave(localTheme);
    setHasChanges(false);
  };

  const sections = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'assets', label: 'Assets', icon: Image }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Theme Editor</h3>
          <p className="text-sm text-muted-foreground">Customize your microsite's appearance</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={resetToOriginal}>
            <Undo2 className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges || isLoading}>
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Theme'}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Colors Section */}
      {activeSection === 'colors' && (
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Define your brand colors and theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={localTheme.tokens.primary}
                    onChange={(e) => updateTokens({ primary: e.target.value })}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={localTheme.tokens.primary}
                    onChange={(e) => updateTokens({ primary: e.target.value })}
                    placeholder="#3B82F6"
                  />
                </div>
                <div className="flex gap-1">
                  {presetColors.blues.map(color => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                      onClick={() => updateTokens({ primary: color })}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={localTheme.tokens.accent}
                    onChange={(e) => updateTokens({ accent: e.target.value })}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={localTheme.tokens.accent}
                    onChange={(e) => updateTokens({ accent: e.target.value })}
                    placeholder="#8B5CF6"
                  />
                </div>
                <div className="flex gap-1">
                  {presetColors.purples.map(color => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                      onClick={() => updateTokens({ accent: color })}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Background</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={localTheme.tokens.background}
                    onChange={(e) => updateTokens({ background: e.target.value })}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={localTheme.tokens.background}
                    onChange={(e) => updateTokens({ background: e.target.value })}
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Foreground</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={localTheme.tokens.foreground}
                    onChange={(e) => updateTokens({ foreground: e.target.value })}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={localTheme.tokens.foreground}
                    onChange={(e) => updateTokens({ foreground: e.target.value })}
                    placeholder="#1F2937"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Typography Section */}
      {activeSection === 'typography' && (
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Choose fonts for headings and body text</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Select
                  value={localTheme.tokens.fontHeading}
                  onValueChange={(value) => updateTokens({ fontHeading: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map(font => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Body Font</Label>
                <Select
                  value={localTheme.tokens.fontBody}
                  onValueChange={(value) => updateTokens({ fontBody: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map(font => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground">Preview</h4>
              <div 
                className="text-2xl font-bold"
                style={{ fontFamily: localTheme.tokens.fontHeading }}
              >
                Heading Text Sample
              </div>
              <div 
                className="text-base"
                style={{ fontFamily: localTheme.tokens.fontBody }}
              >
                This is body text that shows how your content will look with the selected typography. 
                It includes regular text, <strong>bold text</strong>, and <em>italic text</em>.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layout Section */}
      {activeSection === 'layout' && (
        <Card>
          <CardHeader>
            <CardTitle>Layout Settings</CardTitle>
            <CardDescription>Adjust spacing and layout properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Select
                  value={localTheme.tokens.radius}
                  onValueChange={(value) => updateTokens({ radius: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0rem">0rem (Sharp)</SelectItem>
                    <SelectItem value="0.25rem">0.25rem (Subtle)</SelectItem>
                    <SelectItem value="0.5rem">0.5rem (Rounded)</SelectItem>
                    <SelectItem value="0.75rem">0.75rem (More Rounded)</SelectItem>
                    <SelectItem value="1rem">1rem (Very Rounded)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Border Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={localTheme.tokens.border}
                      onChange={(e) => updateTokens({ border: e.target.value })}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={localTheme.tokens.border}
                      onChange={(e) => updateTokens({ border: e.target.value })}
                      placeholder="#E5E7EB"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Muted Background</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={localTheme.tokens.muted}
                      onChange={(e) => updateTokens({ muted: e.target.value })}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={localTheme.tokens.muted}
                      onChange={(e) => updateTokens({ muted: e.target.value })}
                      placeholder="#F3F4F6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets Section */}
      {activeSection === 'assets' && (
        <Card>
          <CardHeader>
            <CardTitle>Brand Assets</CardTitle>
            <CardDescription>Upload your logo, hero image, and favicon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={localTheme.assets.logoUrl || ''}
                  onChange={(e) => updateAssets({ logoUrl: e.target.value })}
                  placeholder="https://your-site.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label>Hero Background Image URL</Label>
                <Input
                  value={localTheme.assets.heroUrl || ''}
                  onChange={(e) => updateAssets({ heroUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div className="space-y-2">
                <Label>Favicon URL</Label>
                <Input
                  value={localTheme.assets.faviconUrl || ''}
                  onChange={(e) => updateAssets({ faviconUrl: e.target.value })}
                  placeholder="https://your-site.com/favicon.ico"
                />
              </div>
            </div>

            {(localTheme.assets.logoUrl || localTheme.assets.heroUrl) && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="text-sm font-medium text-muted-foreground">Preview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {localTheme.assets.logoUrl && (
                    <div className="space-y-2">
                      <Label className="text-xs">Logo</Label>
                      <img 
                        src={localTheme.assets.logoUrl} 
                        alt="Logo preview"
                        className="h-12 object-contain bg-muted rounded"
                      />
                    </div>
                  )}
                  {localTheme.assets.heroUrl && (
                    <div className="space-y-2">
                      <Label className="text-xs">Hero Image</Label>
                      <img 
                        src={localTheme.assets.heroUrl} 
                        alt="Hero preview"
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}