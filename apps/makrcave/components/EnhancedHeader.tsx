'use client';

import React, { useState } from 'react';
import { Menu, X, ExternalLink, Grid3X3, Search, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatUserDisplayName } from '../lib/userUtils';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import Link from 'next/link';

interface EnhancedHeaderProps {
  onMobileMenuClick?: () => void;
}

export default function EnhancedHeader({ onMobileMenuClick }: EnhancedHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLauncher, setShowLauncher] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Equipment", href: "/equipment" },
    { name: "Inventory", href: "/inventory" },
    { name: "Projects", href: "/projects" },
    { name: "Members", href: "/members" },
    { name: "Analytics", href: "/analytics" },
  ];

  const launcherApps = [
    {
      name: "MakrCave",
      description: "Makerspace Management",
      url: "/dashboard",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "bg-blue-500",
    },
    {
      name: "MakrX.Store",
      description: "Tools & Components",
      url: "https://makrx.store",
      bgColor: "bg-green-500/10 dark:bg-green-500/20",
      iconColor: "bg-green-500",
    },
    {
      name: "Gateway",
      description: "Main Hub",
      url: "https://makrx.org",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
      iconColor: "bg-purple-500",
    },
    {
      name: "MakrVerse",
      description: "Global Map",
      url: "/makrverse",
      bgColor: "bg-cyan-500/10 dark:bg-cyan-500/20",
      iconColor: "bg-cyan-500",
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-blue-500/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Left - Logo and Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transition-all group-hover:shadow-blue-500/50">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="hidden sm:block text-lg font-bold text-white font-mono transition-colors group-hover:text-blue-400">
                Makr<span className="text-yellow-400">Cave</span>
              </span>
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 hover:bg-blue-500/10 rounded-lg transition-all text-blue-400 hover:shadow-lg flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                onMobileMenuClick?.();
              }}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Center - Navigation and Search for larger screens */}
          <div className="hidden lg:flex items-center gap-4 flex-1 justify-center max-w-2xl">
            <nav className="flex items-center gap-3">
              {navigation.slice(0, 4).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-xs font-semibold font-mono transition-all text-slate-300 hover:text-blue-400 hover:shadow-lg px-2 py-1 rounded whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-blue-500/30 rounded-md text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-slate-700"
              />
            </div>
          </div>

          {/* Right - Mobile and Desktop Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="lg:hidden p-2 rounded-lg hover:bg-blue-500/10 hover:shadow-lg transition-all text-blue-400"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Universal Launcher - hidden on smallest screens */}
            <div className="hidden sm:block relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLauncher(!showLauncher)}
                className="p-1.5 sm:p-2 rounded-md hover:bg-blue-500/10 hover:shadow-lg transition-all"
                aria-label="Launch Apps"
              >
                <Grid3X3 className="w-4 h-4 text-blue-400" />
              </Button>

              {/* Launcher Dropdown */}
              {showLauncher && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-blue-500/30 p-3 z-50 shadow-xl">
                  <h3 className="font-semibold font-mono text-blue-400 mb-3 text-sm">
                    MakrX Apps
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {launcherApps.map((app) => (
                      <Link
                        key={app.name}
                        href={app.url}
                        className="p-2.5 rounded-lg border border-blue-500/30 hover:border-blue-400/50 hover:shadow-lg transition-all group bg-slate-700/50"
                      >
                        <div
                          className={`w-6 h-6 ${app.bgColor} rounded-md flex items-center justify-center mb-1.5 transition-all group-hover:shadow-lg`}
                        >
                          <div
                            className={`w-3 h-3 ${app.iconColor} rounded transition-all`}
                          ></div>
                        </div>
                        <div className="text-xs font-medium font-mono text-white group-hover:text-blue-400 transition-colors">
                          {app.name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {app.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle - hidden on smallest screens */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hidden sm:flex p-1.5 sm:p-2 rounded-md hover:bg-blue-500/10 hover:shadow-lg transition-all"
              aria-label="Toggle theme"
            >
              <span className="text-yellow-400 text-xs">
                {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🖥️"}
              </span>
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 sm:p-2 rounded-md hover:bg-blue-500/10 hover:shadow-lg transition-all text-blue-400 relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Menu - Compact */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 sm:py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-md shadow-lg backdrop-blur-sm">
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
              <div className="hidden sm:block min-w-0">
                <div className="text-xs font-medium text-white truncate max-w-[80px] lg:max-w-[120px]">
                  {formatUserDisplayName(user)}
                </div>
                <div className="hidden lg:block text-xs text-blue-400 capitalize truncate">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="lg:hidden fixed inset-x-0 top-14 sm:top-16 z-50 bg-slate-900/95 backdrop-blur-md border-b border-blue-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-blue-500/30 rounded-lg text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-slate-700 min-h-[48px]"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileSearch(false)}
              className="p-2 rounded-lg hover:bg-blue-500/10 transition-all text-blue-400"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-blue-500/30 backdrop-blur-sm">
            {/* Mobile Search */}
            <div className="relative mb-3 px-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-blue-500/30 rounded-lg text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-semibold font-mono transition-all text-slate-300 hover:text-blue-400 px-2 py-1.5"
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Launcher */}
              <div className="pt-3 border-t border-slate-700">
                <div className="text-sm font-medium font-mono text-blue-400 mb-2 px-2">
                  MakrX Apps
                </div>
                <div className="space-y-1">
                  {launcherApps.map((app) => (
                    <Link
                      key={app.name}
                      href={app.url}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-500/10 transition-all"
                    >
                      <div
                        className={`w-5 h-5 ${app.bgColor} rounded flex items-center justify-center`}
                      >
                        <div
                          className={`w-2.5 h-2.5 ${app.iconColor} rounded`}
                        ></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium font-mono text-white">
                          {app.name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {app.description}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400 ml-auto" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="pt-3 space-y-2 border-t border-slate-700">
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium font-mono text-slate-300">
                    Theme
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="text-yellow-400 font-mono text-xs"
                  >
                    {theme === "dark" ? "🌙 Dark" : theme === "light" ? "☀️ Light" : "🖥️ System"}
                  </Button>
                </div>
                
                {/* Mobile User Info */}
                <div className="flex items-center gap-2 px-2 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{formatUserDisplayName(user)}</div>
                    <div className="text-xs text-blue-400 capitalize">
                      {user?.role?.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}

      {/* Backdrop for launcher */}
      {showLauncher && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLauncher(false)}
        />
      )}

      {/* Backdrop for mobile search */}
      {showMobileSearch && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setShowMobileSearch(false)}
        />
      )}
    </header>
  );
}