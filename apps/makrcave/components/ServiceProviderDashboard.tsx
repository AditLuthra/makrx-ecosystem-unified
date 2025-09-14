'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  TrendingUp, DollarSign, Package, Clock, 
  Star, MapPin, Phone, Mail, ExternalLink,
  CheckCircle, AlertCircle, Settings
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  actualCost?: number;
  dueDate: Date;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  tags: string[];
}

interface ServiceMetrics {
  totalRevenue: number;
  activeRequests: number;
  completedServices: number;
  averageRating: number;
  responseTime: number; // in hours
}

export default function ServiceProviderDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [metrics, setMetrics] = useState<ServiceMetrics>({
    totalRevenue: 45750,
    activeRequests: 12,
    completedServices: 156,
    averageRating: 4.8,
    responseTime: 2.4,
  });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  // Mock data for demonstration
  const mockRequests: ServiceRequest[] = [
    {
      id: '1',
      title: '3D Printed Prototype',
      description: 'Custom housing for IoT device, PLA material',
      status: 'pending',
      priority: 'high',
      estimatedCost: 2500,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      customer: {
        name: 'Tech Startup Ltd',
        email: 'contact@techstartup.com',
        phone: '+91 98765 43210',
      },
      tags: ['3D Printing', 'Prototype', 'PLA'],
    },
    {
      id: '2',
      title: 'Laser Cut Panels',
      description: 'Acrylic panels for display cabinet, 5mm thickness',
      status: 'in_progress',
      priority: 'medium',
      estimatedCost: 1800,
      actualCost: 1750,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      customer: {
        name: 'Design Studio',
        email: 'orders@designstudio.com',
      },
      tags: ['Laser Cutting', 'Acrylic', 'Cabinet'],
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredRequests = requests.filter(request => 
    selectedFilter === 'all' || request.status === selectedFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAcceptRequest = useCallback((requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'in_progress' as const }
          : req
      )
    );
  }, []);

  const handleCompleteRequest = useCallback((requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'completed' as const }
          : req
      )
    );
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeRequests}</div>
            <p className="text-xs text-muted-foreground">
              3 pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completedServices}</div>
            <p className="text-xs text-muted-foreground">
              +18 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              Based on 89 reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}h</div>
            <p className="text-xs text-muted-foreground">
              -0.5h from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Requests</CardTitle>
              <CardDescription>
                Manage and track your service requests
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'in_progress', 'completed'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className="capitalize"
                >
                  {filter.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No requests found for the selected filter.
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getPriorityColor(request.priority)}`}
                      />
                      <h3 className="font-medium">{request.title}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {request.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>₹{request.estimatedCost.toLocaleString()}</span>
                      <span>Due: {request.dueDate.toLocaleDateString()}</span>
                      <span>{request.customer.name}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      {request.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        Accept
                      </Button>
                    )}
                    {request.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteRequest(request.id)}
                      >
                        Complete
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
