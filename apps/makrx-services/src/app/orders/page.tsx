'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Search,
  Filter,
  Printer,
  Scissors,
  Eye,
  MessageSquare,
  RefreshCw,
  Star,
  DollarSign,
  Calendar,
  Wrench,
  User,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useServiceOrders, ServiceOrder } from '@/contexts/ServiceOrderContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatPrice, formatDateRelative, getStatusColor, getStatusLabel } from '@/lib/utils';

const filterOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'dispatched', label: 'Finding Provider' },
  { value: 'accepted', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'delivered', label: 'Delivered' },
];

export default function OrdersPage() {
  const { orders, getUserOrders, addStatusUpdate, loading } = useServiceOrders();
  const { success, info } = useNotifications();
  
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedFilter, searchQuery]);

  const loadOrders = async () => {
    try {
      await getUserOrders();
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(order => order.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.material.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredOrders(filtered);
  };

  const getServiceIcon = (serviceType: string) => {
    return serviceType === 'printing' ? Printer : Scissors;
  };

  const getServiceColor = (serviceType: string) => {
    return serviceType === 'printing' ? 'text-blue-600' : 'text-purple-600';
  };

  const handleRefresh = async () => {
    await loadOrders();
    info('Orders Refreshed', 'Your order list has been updated');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-makrx-teal" />
          <p className="text-gray-600 text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <Wrench className="h-6 w-6 text-makrx-teal" />
                <span className="text-xl font-bold text-gray-900">MakrX Services</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/3d-printing" className="text-gray-600 hover:text-gray-900">
                3D Printing
              </Link>
              <Link href="/laser-engraving" className="text-gray-600 hover:text-gray-900">
                Laser Engraving
              </Link>
              <Link href="/provider-dashboard" className="text-gray-600 hover:text-gray-900">
                Providers
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Service Orders</h1>
            <p className="text-gray-600 mt-1">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Link href="/3d-printing">
              <Button className="bg-makrx-teal hover:bg-makrx-teal/90">
                New Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, file name, or material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-teal focus:border-makrx-teal"
                />
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedFilter === option.value
                        ? 'bg-makrx-teal text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || selectedFilter !== 'all' ? 'No orders found' : 'No orders yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by placing your first service order'
                }
              </p>
              {!searchQuery && selectedFilter === 'all' && (
                <div className="flex justify-center space-x-4">
                  <Link href="/3d-printing">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Printer className="h-4 w-4 mr-2" />
                      3D Printing
                    </Button>
                  </Link>
                  <Link href="/laser-engraving">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Scissors className="h-4 w-4 mr-2" />
                      Laser Engraving
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const ServiceIcon = getServiceIcon(order.service_type);
              const serviceColor = getServiceColor(order.service_type);
              
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg bg-gray-50`}>
                          <ServiceIcon className={`h-6 w-6 ${serviceColor}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.id.slice(-8)}
                            </h3>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDateRelative(order.created_at)}
                            </span>
                            <span className="capitalize">
                              {order.service_type === 'printing' ? '3D Printing' : 'Laser Engraving'}
                            </span>
                            <span>{order.material}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(order.total_price)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Qty: {order.quantity}
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">File</p>
                        <p className="text-sm text-gray-900 truncate" title={order.file_name}>
                          {order.file_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Material</p>
                        <p className="text-sm text-gray-900">
                          {order.material} {order.color_finish && `(${order.color_finish})`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Priority</p>
                        <p className="text-sm text-gray-900 capitalize">
                          {order.priority}
                          {order.priority === 'rush' && (
                            <span className="ml-1 text-orange-600">🔥</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Provider Information */}
                    {order.provider_name && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">
                              Provider: {order.provider_name}
                            </span>
                          </div>
                          {order.estimated_completion && (
                            <div className="text-sm text-blue-700">
                              Est. completion: {new Date(order.estimated_completion).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recent Status Updates */}
                    {order.status_updates && order.status_updates.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Recent Updates</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {order.status_updates.slice(-3).map((update, index) => (
                            <div key={index} className="flex items-start space-x-3 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="text-gray-900">{update.message}</p>
                                <p className="text-gray-500 text-xs">
                                  {formatDateRelative(update.timestamp)} • {update.user_type}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                        
                        {order.provider_name && (
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message Provider
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {order.sync_status === 'synced' && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Synced with main store</span>
                          </div>
                        )}
                        
                        {order.status === 'delivered' && (
                          <Link 
                            href={`/orders/${order.id}/review`}
                            className="flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <Star className="h-4 w-4 mr-1" />
                            <span>Write Review</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}