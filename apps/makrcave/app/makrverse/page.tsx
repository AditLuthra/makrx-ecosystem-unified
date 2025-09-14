'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  MapPin,
  Zap,
  Users,
  Settings,
  Play,
  Pause,
  Volume2,
  Search,
  Filter,
  Globe,
  Layers,
  Star,
  Trophy,
  Navigation,
  Eye,
  Wifi,
  Wrench,
  Calendar,
  Clock,
  Activity,
  Home,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Bell,
} from 'lucide-react';
import Link from 'next/link';

// Enhanced MakrCaves data with real-world locations
interface MakrCave {
  id: number;
  name: string;
  location: { lat: number; lng: number };
  country: string;
  city: string;
  activeProjects: number;
  onlineMembers: number;
  machinesRunning: number;
  status: string;
  specialization: string[];
  currentProject: string;
  featured: boolean;
  capacity: number;
  utilizationRate: number;
}

const makrCaves: MakrCave[] = [
  {
    id: 1,
    name: 'Bangalore Innovation Hub',
    location: { lat: 12.9716, lng: 77.5946 },
    country: 'India',
    city: 'Bangalore',
    activeProjects: 24,
    onlineMembers: 45,
    machinesRunning: 12,
    status: 'active',
    specialization: ['3D Printing', 'Electronics', 'IoT', 'Robotics'],
    currentProject: 'Smart City Sensors',
    featured: true,
    capacity: 100,
    utilizationRate: 78,
  },
  {
    id: 2,
    name: 'Mumbai MakerSpace',
    location: { lat: 19.076, lng: 72.8777 },
    country: 'India',
    city: 'Mumbai',
    activeProjects: 18,
    onlineMembers: 31,
    machinesRunning: 8,
    status: 'active',
    specialization: ['Laser Cutting', 'CNC', 'Product Design'],
    currentProject: 'Sustainable Packaging',
    featured: false,
    capacity: 80,
    utilizationRate: 65,
  },
  {
    id: 3,
    name: 'Delhi Tech Forge',
    location: { lat: 28.6139, lng: 77.209 },
    country: 'India',
    city: 'Delhi',
    activeProjects: 22,
    onlineMembers: 38,
    machinesRunning: 10,
    status: 'active',
    specialization: ['AI/ML', 'Embedded Systems', 'Hardware'],
    currentProject: 'Agricultural Automation',
    featured: true,
    capacity: 120,
    utilizationRate: 82,
  },
  {
    id: 4,
    name: 'Pune Innovation Lab',
    location: { lat: 18.5204, lng: 73.8567 },
    country: 'India',
    city: 'Pune',
    activeProjects: 16,
    onlineMembers: 28,
    machinesRunning: 7,
    status: 'active',
    specialization: ['Automotive Tech', 'Mechanical Design'],
    currentProject: 'Electric Vehicle Components',
    featured: false,
    capacity: 90,
    utilizationRate: 71,
  },
  {
    id: 5,
    name: 'Hyderabad Digital Lab',
    location: { lat: 17.385, lng: 78.4867 },
    country: 'India',
    city: 'Hyderabad',
    activeProjects: 20,
    onlineMembers: 35,
    machinesRunning: 9,
    status: 'active',
    specialization: ['Software', 'Blockchain', 'Cybersecurity'],
    currentProject: 'Decentralized Identity',
    featured: false,
    capacity: 85,
    utilizationRate: 68,
  },
  {
    id: 6,
    name: 'Chennai Maker Hub',
    location: { lat: 13.0827, lng: 80.2707 },
    country: 'India',
    city: 'Chennai',
    activeProjects: 19,
    onlineMembers: 33,
    machinesRunning: 11,
    status: 'active',
    specialization: ['Aerospace', 'Marine Tech', 'Precision Machining'],
    currentProject: 'Drone Navigation System',
    featured: true,
    capacity: 110,
    utilizationRate: 75,
  },
];

const globalStats = {
  totalMakrCaves: makrCaves.length,
  activeMakers: makrCaves.reduce((sum, cave) => sum + cave.onlineMembers, 0),
  runningProjects: makrCaves.reduce((sum, cave) => sum + cave.activeProjects, 0),
  activeMachines: makrCaves.reduce((sum, cave) => sum + cave.machinesRunning, 0),
};

// Real-time activity feed
const activityTypes = [
  'Project started',
  'Machine activated',
  'Member joined',
  'Equipment booked',
  'Project completed',
  'Workshop scheduled',
  'Collaboration formed',
  'Resource shared',
];

const generateActivity = () => {
  const cave = makrCaves[Math.floor(Math.random() * makrCaves.length)];
  const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
  return {
    id: Date.now() + Math.random(),
    cave: cave.name,
    activity,
    timestamp: new Date(),
    user: `User${Math.floor(Math.random() * 100)}`,
  };
};

export default function MakrVersePage() {
  const [selectedCave, setSelectedCave] = useState<MakrCave | null>(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'detailed'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [realTimeData, setRealTimeData] = useState(false);
  const [animateMarkers, setAnimateMarkers] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const mapRef = useRef(null);

  const filteredCaves = makrCaves.filter((cave) => {
    const matchesSearch =
      cave.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cave.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterSpecialization === 'all' ||
      cave.specialization.some((spec) =>
        spec.toLowerCase().includes(filterSpecialization.toLowerCase()),
      );
    return matchesSearch && matchesFilter;
  });

  const specializations = ['all', ...new Set(makrCaves.flatMap((cave) => cave.specialization))];

  // Initialize map and real-time updates
  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current) {
      initializeMap();
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (realTimeData) {
        // Add new activity
        setActivities((prev) => [generateActivity(), ...prev.slice(0, 9)]);

        // Simulate small changes in online members and running machines
        setSelectedCave((prev) => {
          if (prev) {
            return {
              ...prev,
              onlineMembers: Math.max(1, prev.onlineMembers + Math.floor(Math.random() * 6) - 2),
              machinesRunning: Math.max(
                0,
                prev.machinesRunning + Math.floor(Math.random() * 3) - 1,
              ),
            };
          }
          return prev;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [realTimeData]);

  const initializeMap = () => {
    // Simple SVG world map with Indian subcontinent focus
    const svg = `
      <svg viewBox="0 0 1000 500" className="w-full h-full">
        <!-- India outline (simplified) -->
        <path d="M320 180 L340 160 L380 170 L420 180 L450 200 L470 240 L460 280 L440 320 L400 340 L360 330 L340 310 L320 280 L310 240 Z" 
              fill="rgba(59, 130, 246, 0.1)" 
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="1"/>
        <!-- Other continents (very simplified) -->
        <path d="M100 200 L200 180 L250 220 L200 260 L100 240 Z" 
              fill="rgba(75, 85, 99, 0.1)" 
              stroke="rgba(75, 85, 99, 0.2)" 
              strokeWidth="1"/>
        <path d="M600 150 L750 140 L780 200 L750 250 L600 240 Z" 
              fill="rgba(75, 85, 99, 0.1)" 
              stroke="rgba(75, 85, 99, 0.2)" 
              strokeWidth="1"/>
      </svg>
    `;

    if (mapRef.current) {
      (mapRef.current as HTMLElement).innerHTML = svg;
    }
  };

  const getMarkerPosition = (cave: MakrCave) => {
    // Convert lat/lng to SVG coordinates (focused on India)
    const x = ((cave.location.lng - 65) / 25) * 200 + 320; // India longitude range
    const y = ((35 - cave.location.lat) / 25) * 160 + 180; // India latitude range
    return { x, y };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-blue-500/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                MakrVerse
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overview')}
                className="text-xs"
              >
                <Globe className="w-3 h-3 mr-1" />
                Overview
              </Button>
              <Button
                variant={viewMode === 'detailed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('detailed')}
                className="text-xs"
              >
                <Layers className="w-3 h-3 mr-1" />
                Detailed
              </Button>
              <Button
                variant={realTimeData ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRealTimeData(!realTimeData)}
                className="text-xs"
              >
                <Activity className="w-3 h-3 mr-1" />
                {realTimeData ? 'Live' : 'Static'}
              </Button>
              <Button
                variant={showActivityFeed ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowActivityFeed(!showActivityFeed)}
                className="text-xs"
              >
                <Bell className="w-3 h-3 mr-1" />
                Activity
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{globalStats.totalMakrCaves}</div>
                  <div className="text-xs text-gray-400">Active MakrCaves</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{globalStats.activeMakers}</div>
                  <div className="text-xs text-gray-400">Online Makers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{globalStats.runningProjects}</div>
                  <div className="text-xs text-gray-400">Active Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{globalStats.activeMachines}</div>
                  <div className="text-xs text-gray-400">Running Machines</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search MakrCaves by name, city, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-blue-500/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec} className="bg-slate-800">
                  {spec === 'all' ? 'All Specializations' : spec}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnimateMarkers(!animateMarkers)}
              className="px-3"
            >
              <Zap className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map */}
          <div className={showActivityFeed ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <Card className="bg-slate-800/50 border-blue-500/30 h-96">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-blue-400">Global MakrVerse Map</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
                  {/* World Map Background */}
                  <div className="absolute inset-0 opacity-30">
                    <svg viewBox="0 0 1000 500" className="w-full h-full">
                      {/* Simplified world map */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="rgba(59, 130, 246, 0.1)"
                            strokeWidth="1"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* India (detailed) */}
                      <path
                        d="M320 180 L340 160 L380 170 L420 180 L450 200 L470 240 L460 280 L440 320 L400 340 L360 330 L340 310 L320 280 L310 240 Z"
                        fill="rgba(59, 130, 246, 0.2)"
                        stroke="rgba(59, 130, 246, 0.5)"
                        strokeWidth="2"
                      />

                      {/* Other continents */}
                      <path
                        d="M100 200 L200 180 L250 220 L200 260 L100 240 Z"
                        fill="rgba(75, 85, 99, 0.1)"
                        stroke="rgba(75, 85, 99, 0.3)"
                        strokeWidth="1"
                      />
                      <path
                        d="M600 150 L750 140 L780 200 L750 250 L600 240 Z"
                        fill="rgba(75, 85, 99, 0.1)"
                        stroke="rgba(75, 85, 99, 0.3)"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>

                  {/* MakrCave Markers */}
                  <div className="absolute inset-0">
                    {filteredCaves.map((cave) => {
                      const pos = getMarkerPosition(cave);
                      return (
                        <div
                          key={cave.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                          style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                          onClick={() => setSelectedCave(cave)}
                        >
                          <div
                            className={`relative w-5 h-5 rounded-full border-2 ${
                              cave.featured
                                ? 'bg-yellow-400 border-yellow-300 shadow-yellow-400/50'
                                : 'bg-blue-400 border-blue-300 shadow-blue-400/50'
                            } shadow-lg ${animateMarkers ? 'animate-pulse' : ''} transition-all hover:scale-110`}
                          >
                            {/* Activity indicator */}
                            <div
                              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                                cave.status === 'active'
                                  ? 'bg-green-400 animate-ping'
                                  : 'bg-gray-400'
                              }`}
                            ></div>
                          </div>
                          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-slate-800 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {cave.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          {showActivityFeed && (
            <div className="space-y-4">
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Live Activity Feed
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Real-time updates from MakrVerse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                  {activities.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Enable Live mode to see real-time activity</p>
                    </div>
                  ) : (
                    activities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="p-3 rounded-lg bg-slate-700/30 border border-blue-500/10 hover:border-blue-400/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-white">
                            {activity.activity}
                          </span>
                          <span className="text-xs text-gray-400">
                            {activity.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300">{activity.cave}</p>
                        <p className="text-xs text-blue-400">{activity.user}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Selected Cave Details or Cave List */}
          <div className="space-y-4">
            {selectedCave ? (
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedCave.featured && <Star className="w-4 h-4 text-yellow-400" />}
                      <CardTitle className="text-lg text-blue-400">{selectedCave.name}</CardTitle>
                    </div>
                    <Badge variant={selectedCave.status === 'active' ? 'default' : 'secondary'}>
                      {selectedCave.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">
                    {selectedCave.city}, {selectedCave.country}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>{selectedCave.onlineMembers} online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-400" />
                      <span>{selectedCave.activeProjects} projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-orange-400" />
                      <span>{selectedCave.machinesRunning} machines</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>{selectedCave.utilizationRate}% utilization</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCave.specialization.map((spec: string) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Current Focus</h4>
                    <p className="text-sm text-gray-300">{selectedCave.currentProject}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Capacity</h4>
                    <Progress value={selectedCave.utilizationRate} className="h-2" />
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedCave.utilizationRate}% of {selectedCave.capacity} member capacity
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => window.open(`/makrcave/${selectedCave.id}`, '_blank')}
                    >
                      <Wifi className="w-4 h-4 mr-2" />
                      Connect to MakrCave
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        View Projects
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule Visit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-400">MakrCaves</CardTitle>
                  <CardDescription className="text-gray-400">
                    Click on a marker to view details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                  {filteredCaves.map((cave) => (
                    <div
                      key={cave.id}
                      className="p-3 rounded-lg bg-slate-700/50 border border-blue-500/20 hover:border-blue-400/50 cursor-pointer transition-all"
                      onClick={() => setSelectedCave(cave)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {cave.featured && <Star className="w-3 h-3 text-yellow-400" />}
                          <span className="font-medium text-white text-sm">{cave.name}</span>
                        </div>
                        <Badge
                          variant={cave.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {cave.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {cave.city}, {cave.country}
                      </p>
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>{cave.onlineMembers} online</span>
                        <span>{cave.activeProjects} projects</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
