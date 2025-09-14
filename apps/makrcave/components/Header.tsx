'use client';

import { Search, Menu, User as UserIcon, Grid3X3, Bell, X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useKeycloak } from '@makrx/auth';
import { formatUserDisplayName } from '../lib/userUtils';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import Link from 'next/link';

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showApps, setShowApps] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, logout } = useKeycloak();
  const { theme, toggleTheme } = useTheme();
  
  const appsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) {
        setShowApps(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-blue-500/30 transition-all shadow-lg">
        <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
            
            {/* Left Section - Logo & Mobile Menu */}
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-1.5 sm:p-2 hover:bg-blue-500/10 rounded-lg transition-all text-blue-400 hover:shadow-sm"
                onClick={onMobileMenuClick}
                aria-label="Toggle mobile menu"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Logo */}
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">M</span>
                </div>
                <span className="hidden xs:block sm:text-lg font-bold text-white whitespace-nowrap">
                  MakrCave
                </span>
              </Link>
            </div>

            {/* Center Section - Search (Desktop) */}
            <div className="hidden md:flex flex-1 justify-center max-w-sm lg:max-w-md xl:max-w-lg mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search equipment, projects, members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 lg:py-2.5 bg-slate-800/80 border border-blue-500/20 rounded-lg text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 transition-all duration-200 hover:bg-slate-700/80 hover:border-blue-500/30"
                />
              </div>
            </div>

            {/* Right Section - Actions & User */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink-0">
              
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-blue-500/10 hover:shadow-sm transition-all text-blue-400"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* Apps Launcher - Hidden on small screens */}
              <div className="hidden sm:block relative" ref={appsRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowApps(!showApps);
                    setShowUserMenu(false);
                  }}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-500/10 hover:shadow-sm transition-all text-blue-400"
                  aria-label="MakrX Apps"
                >
                  <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>

                {showApps && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-blue-400">MakrX Ecosystem</h3>
                      <button
                        onClick={() => setShowApps(false)}
                        className="p-1 hover:bg-blue-500/10 rounded text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Link 
                        href="/dashboard" 
                        onClick={() => setShowApps(false)}
                        className="p-3 rounded-lg border border-blue-500/30 hover:border-blue-400/50 hover:shadow-md transition-all group bg-slate-700/50 hover:bg-slate-700/70"
                      >
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        </div>
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          MakrCave
                        </div>
                        <div className="text-xs text-gray-400">Management</div>
                      </Link>
                      <a
                        href="https://makrx.store"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg border border-blue-500/30 hover:border-blue-400/50 hover:shadow-md transition-all group bg-slate-700/50 hover:bg-slate-700/70"
                      >
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                        </div>
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          Store
                        </div>
                        <div className="text-xs text-gray-400">Shop & Tools</div>
                      </a>
                      <a
                        href="https://makrx.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg border border-blue-500/30 hover:border-blue-400/50 hover:shadow-md transition-all group bg-slate-700/50 hover:bg-slate-700/70"
                      >
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        </div>
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          Gateway
                        </div>
                        <div className="text-xs text-gray-400">Main Hub</div>
                      </a>
                      <Link 
                        href="/makrverse" 
                        onClick={() => setShowApps(false)}
                        className="p-3 rounded-lg border border-blue-500/30 hover:border-blue-400/50 hover:shadow-md transition-all group bg-slate-700/50 hover:bg-slate-700/70"
                      >
                        <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-2">
                          <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                        </div>
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          MakrVerse
                        </div>
                        <div className="text-xs text-gray-400">Global Map</div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle - Hidden on extra small screens */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hidden xs:flex p-1.5 sm:p-2 rounded-lg hover:bg-blue-500/10 hover:shadow-sm transition-all text-blue-400"
                aria-label="Toggle theme"
              >
                <span className="text-sm sm:text-base">
                  {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🖥️"}
                </span>
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-500/10 hover:shadow-sm transition-all text-blue-400 relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowApps(false);
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg shadow-sm backdrop-blur-sm hover:shadow-md transition-all hover:border-blue-400/50 min-w-0"
                >
                  <UserIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="hidden sm:block min-w-0 text-left">
                    <div className="text-xs sm:text-sm font-medium text-white truncate max-w-[100px] lg:max-w-[150px]">
                      {formatUserDisplayName(user)}
                    </div>
                    <div className="hidden md:block text-xs text-blue-400 capitalize truncate">
                      {(user?.role || user?.roles?.[0] || 'user').replace('_', ' ')}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-blue-500/30 shadow-xl animate-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-blue-500/20">
                      <div className="text-sm font-medium text-white truncate">
                        {formatUserDisplayName(user)}
                      </div>
                      <div className="text-xs text-blue-400 capitalize">
                        {(user?.role || user?.roles?.[0] || 'user').replace('_', ' ')}
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left"
                      >
                        <X className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="md:hidden fixed inset-x-0 top-12 sm:top-14 z-40 bg-slate-900/98 backdrop-blur-md border-b border-blue-500/30">
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-blue-500/30 rounded-lg text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 transition-all duration-200"
                  autoFocus
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSearch(false)}
                className="p-2 rounded-lg hover:bg-blue-500/10 transition-all text-blue-400 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Backdrop */}
      {showMobileSearch && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setShowMobileSearch(false)}
        />
      )}
    </>
  );
}
