'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Star,
  Heart,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Zap,
  Palette,
  Settings,
  User,
  Mail,
  Phone,
  Globe,
} from 'lucide-react';
import { ThemeToggle, useTheme, Card, Button, Text } from '../../lib/theme-clean';

export default function ThemeDemo() {
  const { theme, resolvedTheme } = useTheme();
  const [selectedTab, setSelectedTab] = useState('components');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const tabs = [
    { id: 'components', label: 'Components' },
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'forms', label: 'Forms' },
    { id: 'icons', label: 'Icons' },
  ];

  const colorPalette = [
    { name: 'Primary Blue', class: 'bg-makrx-blue', hex: '#1E40AF' },
    { name: 'Primary Yellow', class: 'bg-makrx-yellow', hex: '#FBB03B' },
    { name: 'Gray 50', class: 'bg-gray-50', hex: '#F9FAFB' },
    { name: 'Gray 100', class: 'bg-gray-100', hex: '#F3F4F6' },
    { name: 'Gray 200', class: 'bg-gray-200', hex: '#E5E7EB' },
    { name: 'Gray 300', class: 'bg-gray-300', hex: '#D1D5DB' },
    { name: 'Gray 400', class: 'bg-gray-400', hex: '#9CA3AF' },
    { name: 'Gray 500', class: 'bg-gray-500', hex: '#6B7280' },
    { name: 'Gray 600', class: 'bg-gray-600', hex: '#4B5563' },
    { name: 'Gray 700', class: 'bg-gray-700', hex: '#374151' },
    { name: 'Gray 800', class: 'bg-gray-800', hex: '#1F2937' },
    { name: 'Gray 900', class: 'bg-gray-900', hex: '#111827' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-8 h-8 text-makrx-blue dark:text-makrx-yellow" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">MakrX Theme Demo</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Preview and test the MakrX design system and theme components
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Text variant="body" className="text-sm">
              Current theme: <strong>{theme}</strong> (resolved: {resolvedTheme})
            </Text>
            <ThemeToggle showLabel variant="default" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-makrx-blue text-white dark:bg-makrx-yellow dark:text-makrx-blue'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Components Tab */}
        {selectedTab === 'components' && (
          <div className="space-y-12">
            {/* Buttons */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Buttons</h2>
              <div className="grid gap-6">
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="destructive">Destructive Button</Button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" size="sm">
                    Small
                  </Button>
                  <Button variant="primary" size="default">
                    Default
                  </Button>
                  <Button variant="primary" size="lg">
                    Large
                  </Button>
                </div>
              </div>
            </section>

            {/* Cards */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Cards</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card variant="default" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Default Card
                  </h3>
                  <Text variant="body">
                    This is a default card with standard styling and border.
                  </Text>
                </Card>

                <Card variant="elevated" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Elevated Card
                  </h3>
                  <Text variant="body">This card has a shadow for a elevated appearance.</Text>
                </Card>

                <Card variant="outline" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Outline Card
                  </h3>
                  <Text variant="body">This card has a thicker border and hover effects.</Text>
                </Card>
              </div>
            </section>

            {/* Alerts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Alerts</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <Text variant="body" className="text-blue-800 dark:text-blue-300">
                    This is an informational alert with helpful information.
                  </Text>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <Text variant="body" className="text-green-800 dark:text-green-300">
                    Success! Your action was completed successfully.
                  </Text>
                </div>

                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <Text variant="body" className="text-yellow-800 dark:text-yellow-300">
                    Warning: Please review this information carefully.
                  </Text>
                </div>

                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <Text variant="body" className="text-red-800 dark:text-red-300">
                    Error: Something went wrong. Please try again.
                  </Text>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Colors Tab */}
        {selectedTab === 'colors' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Color Palette
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {colorPalette.map((color) => (
                  <div key={color.name} className="group">
                    <div
                      className={`w-full h-20 rounded-lg mb-2 ${color.class} border border-gray-200 dark:border-gray-700`}
                    />
                    <Text variant="caption" className="font-medium">
                      {color.name}
                    </Text>
                    <Text variant="muted" className="text-xs">
                      {color.hex}
                    </Text>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Typography Tab */}
        {selectedTab === 'typography' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Typography Scale
              </h2>
              <div className="space-y-6">
                <div>
                  <Text variant="heading" as="h1" className="text-4xl">
                    Heading 1 - 4xl
                  </Text>
                  <Text variant="muted" className="text-xs mt-1">
                    font-bold text-4xl
                  </Text>
                </div>

                <div>
                  <Text variant="heading" as="h2" className="text-3xl">
                    Heading 2 - 3xl
                  </Text>
                  <Text variant="muted" className="text-xs mt-1">
                    font-bold text-3xl
                  </Text>
                </div>

                <div>
                  <Text variant="subheading" as="h3">
                    Subheading - lg
                  </Text>
                  <Text variant="muted" className="text-xs mt-1">
                    font-semibold text-lg
                  </Text>
                </div>

                <div>
                  <Text variant="body">Body text - base</Text>
                  <Text variant="muted" className="text-xs mt-1">
                    font-normal text-base
                  </Text>
                </div>

                <div>
                  <Text variant="caption">Caption text - sm</Text>
                  <Text variant="muted" className="text-xs mt-1">
                    font-normal text-sm
                  </Text>
                </div>

                <div>
                  <Text variant="muted">Muted text - sm</Text>
                  <Text variant="muted" className="text-xs mt-1">
                    font-normal text-sm text-gray-500
                  </Text>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Forms Tab */}
        {selectedTab === 'forms' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Form Elements
              </h2>
              <Card className="p-8 max-w-2xl">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-makrx-blue dark:focus:ring-makrx-yellow focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-makrx-blue dark:focus:ring-makrx-yellow focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          message: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-makrx-blue dark:focus:ring-makrx-yellow focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      placeholder="Enter your message"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button variant="primary" type="submit">
                      Submit Form
                    </Button>
                    <Button variant="outline" type="button">
                      Reset
                    </Button>
                  </div>
                </form>
              </Card>
            </section>
          </div>
        )}

        {/* Icons Tab */}
        {selectedTab === 'icons' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Lucide Icons
              </h2>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                {[
                  { icon: <Sun className="w-6 h-6" />, name: 'Sun' },
                  { icon: <Moon className="w-6 h-6" />, name: 'Moon' },
                  { icon: <Monitor className="w-6 h-6" />, name: 'Monitor' },
                  { icon: <Star className="w-6 h-6" />, name: 'Star' },
                  { icon: <Heart className="w-6 h-6" />, name: 'Heart' },
                  {
                    icon: <CheckCircle className="w-6 h-6" />,
                    name: 'CheckCircle',
                  },
                  {
                    icon: <AlertTriangle className="w-6 h-6" />,
                    name: 'AlertTriangle',
                  },
                  { icon: <Info className="w-6 h-6" />, name: 'Info' },
                  { icon: <XCircle className="w-6 h-6" />, name: 'XCircle' },
                  { icon: <Zap className="w-6 h-6" />, name: 'Zap' },
                  { icon: <Settings className="w-6 h-6" />, name: 'Settings' },
                  { icon: <User className="w-6 h-6" />, name: 'User' },
                  { icon: <Mail className="w-6 h-6" />, name: 'Mail' },
                  { icon: <Phone className="w-6 h-6" />, name: 'Phone' },
                  { icon: <Globe className="w-6 h-6" />, name: 'Globe' },
                  { icon: <Palette className="w-6 h-6" />, name: 'Palette' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-gray-700 dark:text-gray-300 mb-2">{item.icon}</div>
                    <Text variant="caption" className="text-center text-xs">
                      {item.name}
                    </Text>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
