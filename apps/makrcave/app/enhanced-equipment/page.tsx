'use client';

import React, { useState, useEffect } from 'react';
import { useAuthHeaders } from '@makrx/auth';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  DollarSign,
  Users,
  Shield,
  Settings,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  BarChart3,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Equipment {
  id: string;
  equipment_id: string;
  name: string;
  category: string;
  status: 'available' | 'in_use' | 'under_maintenance' | 'offline';
  location: string;
  hourly_rate?: number;
  requires_certification: boolean;
  certification_required?: string;
  total_usage_hours: number;
  usage_count: number;
  average_rating: number;
  manufacturer?: string;
  model?: string;
  description?: string;
  image_url?: string;
}

interface EquipmentStats {
  total_equipment: number;
  available_equipment: number;
  in_use_equipment: number;
  maintenance_equipment: number;
  total_reservations_today: number;
  utilization_rate: number;
  revenue_today: number;
  avg_reservation_duration: number;
}

const EnhancedEquipment: React.FC = () => {
  const { user } = useAuth();
  const getHeaders = useAuthHeaders();
  const [activeTab, setActiveTab] = useState('overview');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  // Role-based permissions
  const isAdmin = user?.role === 'super_admin' || user?.role === 'makerspace_admin';
  const canManageEquipment = isAdmin || user?.role === 'service_provider';
  const canViewReservations = true; // All users can view reservations
  const canCreateReservations = user?.role !== 'admin'; // All except admin can reserve

  const loadEquipment = React.useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getHeaders({ 'Content-Type': 'application/json' });
      const response = await fetch('/api/v1/equipment/', { headers });
      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      } else {
        setEquipment([]);
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const loadStats = React.useCallback(async () => {
    try {
      const headers2 = await getHeaders({ 'Content-Type': 'application/json' });
      const response = await fetch('/api/v1/equipment/stats/overview', { headers: headers2 });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(null);
    }
  }, [getHeaders]);

  useEffect(() => {
    loadEquipment();
    loadStats();
  }, [loadEquipment, loadStats]);

  // Note: no mock generators; show empty states when API has no data

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_use':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_use':
        return <Clock className="h-4 w-4" />;
      case 'under_maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'offline':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'printer_3d', label: '3D Printers' },
    { value: 'laser_cutter', label: 'Laser Cutters' },
    { value: 'cnc_machine', label: 'CNC Machines' },
    { value: 'testing_tool', label: 'Testing Tools' },
    { value: 'soldering_station', label: 'Soldering Stations' },
    { value: 'workstation', label: 'Workstations' },
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'in_use', label: 'In Use' },
    { value: 'under_maintenance', label: 'Maintenance' },
    { value: 'offline', label: 'Offline' },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive equipment reservation system with cost rules and skill gating
          </p>
        </div>

        {canManageEquipment && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_equipment}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.utilization_rate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.revenue_today.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Reservations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_reservations_today}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Equipment List with Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Equipment Grid */}
          <div
            className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
          >
            {filteredEquipment.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.equipment_id}</p>
                    </div>
                    <Badge className={`${getStatusColor(item.status)} border`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location:</span>
                      <span>{item.location}</span>
                    </div>
                    {item.hourly_rate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rate:</span>
                        <span className="font-medium">${item.hourly_rate}/hour</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Usage:</span>
                      <span>
                        {item.total_usage_hours.toFixed(1)}h ({item.usage_count} sessions)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{item.average_rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {item.requires_certification && (
                    <div className="mb-4">
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Certification Required
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {canCreateReservations && item.status === 'available' && (
                      <Button size="sm" className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Reserve
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Reservation management interface will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['available', 'in_use', 'under_maintenance', 'offline'].map((status) => {
                    const count = filteredEquipment.filter((eq) => eq.status === status).length;
                    const percentage =
                      filteredEquipment.length > 0 ? (count / filteredEquipment.length) * 100 : 0;
                    const statusColors = {
                      available: 'bg-green-500',
                      in_use: 'bg-blue-500',
                      under_maintenance: 'bg-yellow-500',
                      offline: 'bg-red-500',
                    };

                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
                          ></div>
                          <span className="text-sm font-medium capitalize">
                            {status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">
                        {equipment.length > 0
                          ? (
                              equipment.reduce((sum, eq) => sum + eq.average_rating, 0) /
                              equipment.length
                            ).toFixed(1)
                          : '0.0'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Usage Hours</span>
                    <span className="font-medium">
                      {equipment.reduce((sum, eq) => sum + eq.total_usage_hours, 0).toFixed(1)}h
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Sessions</span>
                    <span className="font-medium">
                      {equipment.reduce((sum, eq) => sum + eq.usage_count, 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Certification Required</span>
                    <span className="font-medium">
                      {equipment.filter((eq) => eq.requires_certification).length} /{' '}
                      {equipment.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedEquipment;
