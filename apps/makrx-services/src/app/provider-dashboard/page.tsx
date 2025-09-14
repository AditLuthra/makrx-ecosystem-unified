"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Package,
  TrendingUp,
  Clock,
  Settings,
  CheckCircle,
  AlertTriangle,
  Camera,
  MessageSquare,
  Star,
  DollarSign,
  BarChart3,
  Printer,
  Scissors,
  RefreshCw,
  Plus,
  Minus,
  ExternalLink,
  Wrench,
  Users,
  Calendar,
  Activity,
  Eye,
  Download
} from "lucide-react";
import { useKeycloak, useAuthHeaders } from '@makrx/auth';
import { formatPrice, formatDateRelative, getStatusColor, getStatusLabel } from "@/lib/utils";
import servicesAPI from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";

interface AvailableJob {
  id: string;
  service_type: "printing" | "engraving";
  material: string;
  quantity: number;
  estimated_value: number;
  priority: "normal" | "rush";
  dispatched_at: string;
  customer_notes?: string;
  file_url?: string;
  preview_url?: string;
  dimensions?: {
    x: number;
    y: number;
    z: number;
  };
  rush_fee?: number;
}

interface AcceptedJob {
  id: string;
  service_type: "printing" | "engraving";
  status: string;
  customer_id: string;
  customer_name?: string;
  material: string;
  quantity: number;
  price: number;
  accepted_at: string;
  estimated_completion?: string;
  customer_notes?: string;
  provider_notes?: string;
  file_url?: string;
  preview_url?: string;
  status_updates: any[];
}

interface InventoryItem {
  id: string;
  material_type: string;
  color_finish: string;
  current_stock: number;
  reserved_stock: number;
  minimum_stock: number;
  cost_per_unit: number;
  reorder_url?: string;
  supplier_name?: string;
  last_updated: string;
}

interface DashboardStats {
  total_jobs: number;
  completed_jobs: number;
  rating: number;
  monthly_revenue: number;
  available_capacity: number;
  response_time_minutes: number;
  completion_rate: number;
  this_week_jobs: number;
  pending_jobs: number;
}

interface Notification {
  id: string;
  type: 'job_available' | 'job_update' | 'inventory_low' | 'rating_received';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
}

export default function ProviderDashboard() {
  const router = useRouter();
  const { isAuthenticated, user, hasRole } = useKeycloak();
  const { success, error: showError, info } = useNotifications();
  // Wire auth headers into services API
  const getHeaders = useAuthHeaders();
  useEffect(() => {
    servicesAPI.setAuthHeaderBuilder(getHeaders);
  }, [getHeaders]);

  // State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [availableJobs, setAvailableJobs] = useState<AvailableJob[]>([]);
  const [acceptedJobs, setAcceptedJobs] = useState<AcceptedJob[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!hasRole('service_provider')) {
      router.push("/become-provider");
      return;
    }
    
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(loadAvailableJobs, 30000);
    const wsConnection = servicesAPI.setupWebSocketConnection(handleWebSocketMessage);
    
    return () => {
      clearInterval(interval);
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [isAuthenticated, hasRole]);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'job_available':
        loadAvailableJobs();
        info('New Job Available', 'A new job matching your capabilities is available');
        break;
      case 'job_accepted':
        if (message.provider_id === user?.id) {
          loadAcceptedJobs();
          success('Job Accepted', 'You have successfully accepted a new job');
        } else {
          loadAvailableJobs(); // Remove job from available list
        }
        break;
      case 'inventory_alert':
        loadInventory();
        showError('Low Stock Alert', message.message);
        break;
      case 'order_update':
        loadAcceptedJobs();
        break;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadDashboardStats(),
        loadAvailableJobs(),
        loadAcceptedJobs(),
        loadInventory(),
        loadNotifications(),
      ]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      showError('Load Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await servicesAPI.getProviderDashboard();
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    }
  };

  const loadAvailableJobs = async () => {
    try {
      const response = await servicesAPI.getAvailableJobs();
      setAvailableJobs(response || []);
    } catch (error) {
      console.error("Failed to load available jobs:", error);
    }
  };

  const loadAcceptedJobs = async () => {
    try {
      const response = await servicesAPI.getProviderJobs();
      setAcceptedJobs(response.jobs || []);
    } catch (error) {
      console.error("Failed to load accepted jobs:", error);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await servicesAPI.getProviderInventory();
      setInventory(response.inventory || []);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await servicesAPI.getProviderDashboard();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const acceptJob = async (jobId: string) => {
    try {
      await servicesAPI.acceptJob(jobId);
      success('Job Accepted', 'Job accepted successfully! Check your active jobs.');
      loadAvailableJobs();
      loadAcceptedJobs();
      loadDashboardStats();
    } catch (error) {
      console.error("Failed to accept job:", error);
      showError('Accept Failed', 'Failed to accept job. It may have been taken by another provider.');
    }
  };

  const updateJobStatus = async (jobId: string, status: string, notes?: string) => {
    try {
      await servicesAPI.updateJobStatus(jobId, status, notes);
      success('Status Updated', 'Job status updated successfully');
      loadAcceptedJobs();
      loadDashboardStats();
    } catch (error) {
      console.error("Failed to update job status:", error);
      showError('Update Failed', 'Failed to update job status');
    }
  };

  const updateInventory = async (materialId: string, quantity: number, action: "add" | "subtract") => {
    try {
      await servicesAPI.updateProviderInventory(materialId, quantity, action);
      loadInventory();
      success('Inventory Updated', `Stock ${action === 'add' ? 'added' : 'removed'} successfully`);
    } catch (error) {
      console.error("Failed to update inventory:", error);
      showError('Inventory Error', 'Failed to update inventory');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-makrx-teal" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Wrench className="h-8 w-8 text-makrx-teal" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.firstName || 'Provider'}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="relative p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100"
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="h-6 w-6" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Online & Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: "dashboard", label: "Overview", icon: BarChart3 },
                { key: "jobs", label: `Available Jobs (${availableJobs.length})`, icon: Bell },
                { key: "active", label: `Active Jobs (${acceptedJobs.filter(j => !['completed', 'delivered'].includes(j.status)).length})`, icon: Package },
                { key: "inventory", label: "Inventory", icon: TrendingUp },
                { key: "analytics", label: "Analytics", icon: Activity },
                { key: "settings", label: "Settings", icon: Settings },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === key
                      ? "border-makrx-teal text-makrx-teal"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="inline-block h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Overview */}
        {activeTab === "dashboard" && stats && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="provider-metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">{formatPrice(stats.monthly_revenue)}</p>
                    <p className="text-sm text-green-600">+12% from last month</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-green-600" />
                </div>
              </div>
              
              <div className="provider-metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.completed_jobs}</p>
                    <p className="text-sm text-blue-600">+{stats.this_week_jobs} this week</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              
              <div className="provider-metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Provider Rating</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.rating.toFixed(1)}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(stats.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <Star className="h-10 w-10 text-yellow-500" />
                </div>
              </div>
              
              <div className="provider-metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                    <p className="text-3xl font-bold text-gray-900">{Math.floor(stats.response_time_minutes / 60)}h {stats.response_time_minutes % 60}m</p>
                    <p className="text-sm text-green-600">Avg response time</p>
                  </div>
                  <Clock className="h-10 w-10 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Available Jobs Preview */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Available Jobs
                  </h3>
                  <button 
                    onClick={() => setActiveTab('jobs')}
                    className="text-makrx-teal hover:text-makrx-teal/80 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-3">
                  {availableJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {job.service_type === "printing" ? (
                          <Printer className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Scissors className="h-5 w-5 text-purple-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{job.material}</p>
                          <p className="text-sm text-gray-600">Qty: {job.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-makrx-teal">{formatPrice(job.estimated_value)}</p>
                        {job.priority === 'rush' && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Rush
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {availableJobs.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No available jobs at the moment</p>
                  )}
                </div>
              </div>

              {/* Active Jobs Preview */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Active Jobs
                  </h3>
                  <button 
                    onClick={() => setActiveTab('active')}
                    className="text-makrx-teal hover:text-makrx-teal/80 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-3">
                  {acceptedJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {job.service_type === "printing" ? (
                          <Printer className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Scissors className="h-5 w-5 text-purple-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">#{job.id.slice(-8)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
                            {getStatusLabel(job.status)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(job.price)}</p>
                        <p className="text-xs text-gray-500">{formatDateRelative(job.accepted_at)}</p>
                      </div>
                    </div>
                  ))}
                  
                  {acceptedJobs.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No active jobs</p>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-sm font-medium">{stats.completion_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${stats.completion_rate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Capacity Utilization</span>
                      <span className="text-sm font-medium">{stats.available_capacity}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${100 - stats.available_capacity}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {notifications.slice(0, 4).map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-makrx-teal rounded-full mt-2 flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500">{formatDateRelative(notification.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Alerts</h3>
                <div className="space-y-3">
                  {inventory.filter(item => item.current_stock <= item.minimum_stock).slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.material_type}</p>
                        <p className="text-xs text-red-600">Low stock: {item.current_stock.toFixed(2)} units</p>
                      </div>
                    </div>
                  ))}
                  
                  {inventory.filter(item => item.current_stock <= item.minimum_stock).length === 0 && (
                    <p className="text-sm text-gray-500">All materials in stock</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Available Jobs Tab */}
        {activeTab === "jobs" && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Available Jobs ({availableJobs.length})
                </h3>
                <p className="text-sm text-gray-600">First-accept-first-serve system</p>
              </div>
              <button
                onClick={loadAvailableJobs}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {availableJobs.length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
                  <p className="text-gray-600 mb-6">Check back soon for new opportunities!</p>
                  <button 
                    onClick={loadAvailableJobs}
                    className="services-button-secondary"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Jobs
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {availableJobs.map((job) => (
                    <div key={job.id} className="provider-job-card">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {job.service_type === "printing" ? (
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <Printer className="h-6 w-6 text-blue-600" />
                            </div>
                          ) : (
                            <div className="bg-purple-100 p-3 rounded-lg">
                              <Scissors className="h-6 w-6 text-purple-600" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {job.service_type === "printing" ? "3D Print Job" : "Laser Engrave Job"}
                            </h4>
                            {job.priority === "rush" && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                🔥 Rush Order
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-makrx-teal">
                            {formatPrice(job.estimated_value)}
                          </p>
                          {job.rush_fee && (
                            <p className="text-sm text-gray-600">
                              +{formatPrice(job.rush_fee)} rush fee
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Material</p>
                          <p className="text-gray-900">{job.material}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Quantity</p>
                          <p className="text-gray-900">{job.quantity}</p>
                        </div>
                        {job.dimensions && (
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Dimensions</p>
                            <p className="text-gray-900">
                              {job.dimensions.x} × {job.dimensions.y} × {job.dimensions.z} mm
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Dispatched: {formatDateRelative(job.dispatched_at)}
                        </p>
                        
                        {job.customer_notes && (
                          <div className="bg-blue-50 p-3 rounded text-sm mt-2">
                            <p className="font-medium text-blue-900 mb-1">Customer Notes:</p>
                            <p className="text-blue-800">{job.customer_notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {job.file_url && (
                            <button 
                              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
                              onClick={() => window.open(job.file_url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                              <span>File</span>
                            </button>
                          )}
                          {job.preview_url && (
                            <button 
                              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
                              onClick={() => setSelectedJobId(job.id)}
                            >
                              <Eye className="h-4 w-4" />
                              <span>Preview</span>
                            </button>
                          )}
                        </div>
                        
                        <button
                          onClick={() => acceptJob(job.id)}
                          className="services-button-primary text-sm py-2"
                        >
                          Accept Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Jobs Tab - Implementation continues... */}
        {activeTab === "active" && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Active Jobs ({acceptedJobs.length})
              </h3>
            </div>
            
            <div className="p-6">
              {acceptedJobs.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active jobs</h3>
                  <p className="text-gray-600 mb-6">Accept available jobs to get started!</p>
                  <button 
                    onClick={() => setActiveTab('jobs')}
                    className="services-button-primary"
                  >
                    Browse Available Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {acceptedJobs.map((job) => (
                    <div key={job.id} className="provider-job-card">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {job.service_type === "printing" ? (
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <Printer className="h-6 w-6 text-blue-600" />
                            </div>
                          ) : (
                            <div className="bg-purple-100 p-3 rounded-lg">
                              <Scissors className="h-6 w-6 text-purple-600" />
                            </div>
                          )}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              Job #{job.id.slice(-8)}
                            </h4>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                              {getStatusLabel(job.status)}
                            </span>
                            {job.customer_name && (
                              <p className="text-sm text-gray-600 mt-1">Customer: {job.customer_name}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{formatPrice(job.price)}</p>
                          <p className="text-sm text-gray-600">
                            Accepted {formatDateRelative(job.accepted_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Material</p>
                          <p className="text-gray-900">{job.material}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Quantity</p>
                          <p className="text-gray-900">{job.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Completion</p>
                          <p className="text-gray-900">
                            {job.estimated_completion 
                              ? formatDateRelative(job.estimated_completion)
                              : 'Not set'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Status Update Controls */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {job.status === "accepted" && (
                            <button
                              onClick={() => updateJobStatus(job.id, "in_progress", "Started working on the job")}
                              className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 font-medium"
                            >
                              Start Work
                            </button>
                          )}
                          
                          {job.status === "in_progress" && (
                            <button
                              onClick={() => updateJobStatus(job.id, "completed", "Job completed and ready for pickup")}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 font-medium"
                            >
                              Mark Complete
                            </button>
                          )}
                          
                          <button className="services-button-secondary text-sm py-2 flex items-center">
                            <Camera className="h-4 w-4 mr-2" />
                            Add Photo
                          </button>
                          
                          <button className="services-button-secondary text-sm py-2 flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Customer
                          </button>
                        </div>

                        <div className="flex space-x-2">
                          {job.file_url && (
                            <button 
                              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                              onClick={() => window.open(job.file_url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          {job.preview_url && (
                            <button 
                              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                              onClick={() => setSelectedJobId(job.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notes Section */}
                      {(job.customer_notes || job.provider_notes) && (
                        <div className="space-y-3">
                          {job.customer_notes && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="font-medium text-blue-900 mb-1">Customer Notes:</p>
                              <p className="text-blue-800 text-sm">{job.customer_notes}</p>
                            </div>
                          )}
                          {job.provider_notes && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <p className="font-medium text-green-900 mb-1">Your Notes:</p>
                              <p className="text-green-800 text-sm">{job.provider_notes}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status Timeline */}
                      {job.status_updates && job.status_updates.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="font-medium text-gray-900 mb-3">Status Updates</h5>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {job.status_updates.slice(-3).map((update, index) => (
                              <div key={index} className="flex items-start space-x-3 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-gray-900">{update.message}</p>
                                  <p className="text-gray-500 text-xs">{formatDateRelative(update.timestamp)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inventory Management Tab */}
        {activeTab === "inventory" && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Material Inventory</h3>
                  <p className="text-sm text-gray-600">Manage your material stock levels</p>
                </div>
                <button className="services-button-primary text-sm py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {inventory.length === 0 ? (
                <div className="text-center py-16">
                  <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory tracked</h3>
                  <p className="text-gray-600 mb-6">Add materials to track your stock levels.</p>
                  <button className="services-button-primary">
                    Add First Material
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {inventory.map((item) => (
                    <div 
                      key={item.id} 
                      className={`inventory-item ${item.current_stock <= item.minimum_stock ? 'inventory-low-stock' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 capitalize">
                            {item.material_type} - {item.color_finish}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Last updated: {formatDateRelative(item.last_updated)}
                          </p>
                        </div>
                        {item.current_stock <= item.minimum_stock && (
                          <AlertTriangle className="h-5 w-5 text-red-500" title="Low Stock Alert" />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Available Stock</p>
                          <p className="text-xl font-bold text-gray-900">{item.current_stock.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Reserved</p>
                          <p className="text-xl font-bold text-yellow-600">{item.reserved_stock.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Minimum Level</p>
                          <p className="text-lg font-medium text-red-600">{item.minimum_stock.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Cost per Unit</p>
                          <p className="text-lg font-medium text-gray-900">{formatPrice(item.cost_per_unit)}</p>
                        </div>
                      </div>

                      {/* Stock Level Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Stock Level</span>
                          <span className="text-sm text-gray-600">
                            {((item.current_stock / Math.max(item.minimum_stock * 3, 1)) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              item.current_stock <= item.minimum_stock 
                                ? "bg-red-500" 
                                : item.current_stock <= item.minimum_stock * 2 
                                  ? "bg-yellow-500" 
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(5, (item.current_stock / Math.max(item.minimum_stock * 3, 1)) * 100))}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateInventory(item.id, 1, "subtract")}
                            className="p-2 text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                            disabled={item.current_stock <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateInventory(item.id, 1, "add")}
                            className="p-2 text-green-600 hover:text-green-700 border border-green-300 rounded-lg hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {item.current_stock <= item.minimum_stock && item.reorder_url && (
                          <a
                            href={item.reorder_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Reorder from {item.supplier_name || "MakrX Store"}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Provider Settings</h3>
            
            <div className="space-y-8">
              {/* Business Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Business Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                      placeholder="contact@yourbusiness.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                      placeholder="City, State"
                    />
                  </div>
                </div>
              </div>

              {/* Service Capabilities */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Service Capabilities</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded border-gray-300 text-makrx-teal focus:ring-makrx-teal" defaultChecked />
                    <div className="flex items-center space-x-2">
                      <Printer className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-900">3D Printing Services</span>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded border-gray-300 text-makrx-teal focus:ring-makrx-teal" />
                    <div className="flex items-center space-x-2">
                      <Scissors className="h-5 w-5 text-purple-600" />
                      <span className="text-gray-900">Laser Engraving Services</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Operational Settings */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Operational Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Concurrent Jobs
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                      defaultValue="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent"
                      defaultValue="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Hours
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-teal focus:border-transparent">
                      <option>9 AM - 6 PM</option>
                      <option>24/7</option>
                      <option>Custom</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Notification Preferences</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded border-gray-300 text-makrx-teal focus:ring-makrx-teal" defaultChecked />
                    <span className="text-gray-900">Email notifications for new jobs</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded border-gray-300 text-makrx-teal focus:ring-makrx-teal" defaultChecked />
                    <span className="text-gray-900">SMS notifications for urgent jobs</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded border-gray-300 text-makrx-teal focus:ring-makrx-teal" />
                    <span className="text-gray-900">Weekly performance reports</span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t">
                <button className="services-button-primary">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
