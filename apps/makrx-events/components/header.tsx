'use client';

import { Button } from '@/components/ui/button';
// import { useAuth } from "@/hooks/useAuth"; // Disabled for public access
import { LogOut, User, Calendar, Trophy, Wrench, ChevronDown, Users } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  // Disable auth for public access
  const user = null;
  const isAuthenticated = false;

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const handleDropdownToggle = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <Link href="/" className="flex items-center group">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-primary transition-all duration-300">
              MakrX.events
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={() => setOpenDropdown(openDropdown === 'mobile' ? null : 'mobile')}
            aria-label="Toggle mobile menu"
          >
            {openDropdown === 'mobile' ? (
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          {/* Mobile Menu */}
          {openDropdown === 'mobile' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 md:hidden">
              <div className="p-4 space-y-3">
                <Link
                  href="/events"
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/competitions"
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Competitions
                </Link>
                <Link
                  href="/workshops"
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Workshops
                </Link>
                <Link
                  href="/admin"
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/create-event"
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Create Event
                </Link>
              </div>
            </div>
          )}

          <nav ref={navRef} className="hidden md:flex items-center space-x-6 relative">
            {/* Events Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle('events')}
                className="flex items-center text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Events
                <ChevronDown
                  className={`h-4 w-4 ml-1 transition-transform duration-200 ${openDropdown === 'events' ? 'rotate-180' : ''}`}
                />
              </button>
              {openDropdown === 'events' && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200/50 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                        Featured Events
                      </h4>
                      <Link
                        href="/events/maker-fest-2024"
                        className="block p-3 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-50 transition-all duration-200 group"
                      >
                        <div className="font-medium text-sm group-hover:text-primary">
                          Maker Fest 2024
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Annual maker festival with competitions and workshops
                        </div>
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <Link
                        href="/events"
                        className="block p-3 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-50 transition-all duration-200 group"
                      >
                        <div className="font-medium text-sm group-hover:text-primary">
                          View All Events
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Discover all upcoming maker events
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Competitions Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle('competitions')}
                className="flex items-center text-gray-700 hover:text-primary transition-colors font-medium"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Competitions
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              {openDropdown === 'competitions' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Active Competitions
                      </h4>
                      <Link
                        href="/events/robotics-championship"
                        className="block p-2 rounded hover:bg-gray-50"
                      >
                        <div className="font-medium text-sm">Robotics Championship</div>
                        <div className="text-xs text-gray-600">
                          Build and compete with autonomous robots
                        </div>
                      </Link>
                    </div>
                    <div className="border-t pt-2">
                      <Link href="/competitions" className="block p-2 rounded hover:bg-gray-50">
                        <div className="font-medium text-sm">Browse All Competitions</div>
                        <div className="text-xs text-gray-600">
                          Find competitive events to showcase your skills
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle('categories')}
                className="flex items-center text-gray-700 hover:text-primary transition-colors font-medium"
              >
                Categories
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              {openDropdown === 'categories' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="p-4 space-y-2">
                    <Link
                      href="/workshops"
                      className="flex items-center p-2 rounded hover:bg-gray-50"
                    >
                      <Wrench className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <div className="font-medium text-sm">Workshops</div>
                        <div className="text-xs text-gray-600">Hands-on learning experiences</div>
                      </div>
                    </Link>
                    <Link
                      href="/competitions"
                      className="flex items-center p-2 rounded hover:bg-gray-50"
                    >
                      <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                      <div>
                        <div className="font-medium text-sm">Competitions</div>
                        <div className="text-xs text-gray-600">Competitive maker challenges</div>
                      </div>
                    </Link>
                    <Link
                      href="/categories/hackathons"
                      className="flex items-center p-2 rounded hover:bg-gray-50"
                    >
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      <div>
                        <div className="font-medium text-sm">Hackathons</div>
                        <div className="text-xs text-gray-600">Intensive coding events</div>
                      </div>
                    </Link>
                    <Link
                      href="/categories/meetups"
                      className="flex items-center p-2 rounded hover:bg-gray-50"
                    >
                      <Users className="h-4 w-4 mr-2 text-orange-500" />
                      <div>
                        <div className="font-medium text-sm">Meetups</div>
                        <div className="text-xs text-gray-600">Community networking events</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          <nav className="hidden lg:flex items-center space-x-6 ml-8">
            <Link href="/admin" className="text-gray-700 hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link
              href="/create-event"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Create Event
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hover:bg-gray-50 hover:border-primary/30 transition-all duration-200 hidden sm:flex text-xs sm:text-sm px-2 sm:px-3"
            >
              <Link href="/dashboard/user">
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hover:bg-gray-50 hover:border-primary/30 transition-all duration-200 sm:hidden p-2"
            >
              <Link href="/dashboard/user">
                <User className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm px-3 sm:px-4"
            >
              <Link href="/api/login">
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">Sign In</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
