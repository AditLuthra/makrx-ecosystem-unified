'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  Phone,
  Mail,
  Package,
  Star,
  MessageSquare,
  Camera,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Printer,
  Scissors,
  User,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { storeApi, formatPrice } from '@/services/storeApi';
import { useAuth } from '@/contexts/AuthContext';

interface OrderStatus {
  id: string;
  status: 'created' | 'dispatched' | 'accepted' | 'in_progress' | 'completed' | 'delivered';
  customer_id: string;
  quote: {
    service_type: 'printing' | 'engraving';
    material: string;
    quantity: number;
    price: number;
    currency: string;
    estimated_time_hours: number;
  };
  provider?: {
    id: string;
    business_name: string;
    contact_name: string;
    email: string;
    phone?: string;
    rating: number;
    address: string;
  };
  created_at: string;
  accepted_at?: string;
  estimated_completion?: string;
  actual_completion?: string;
  delivery_method: string;
  delivery_address?: any;
  status_messages: Array<{
    timestamp: string;
    status: string;
    message: string;
    images?: string[];
  }>;
  customer_notes?: string;
  provider_notes?: string;
}

const STATUS_STEPS = [
  {
    key: 'created',
    label: 'Order Created',
    description: 'Your order has been placed and payment confirmed',
    icon: Package,
  },
  {
    key: 'dispatched',
    label: 'Finding Provider',
    description: "We're matching you with the best available provider",
    icon: Clock,
  },
  {
    key: 'accepted',
    label: 'Provider Assigned',
    description: 'A provider has accepted your job and will begin work',
    icon: CheckCircle,
  },
  {
    key: 'in_progress',
    label: 'In Production',
    description: 'Your item is being printed/engraved',
    icon: Printer,
  },
  {
    key: 'completed',
    label: 'Ready for Pickup',
    description: 'Your item is complete and ready for collection',
    icon: CheckCircle,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Order has been delivered to you',
    icon: Truck,
  },
];

export default function OrderTracking() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrder();

    // Set up polling for active orders
    const interval = setInterval(() => {
      if (order && !['completed', 'delivered'].includes(order.status)) {
        refreshOrder();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [orderId, order?.status]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeApi.getServiceOrder(orderId);
      setOrder(response);
    } catch (err: any) {
      console.error('Failed to load order:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrder = async () => {
    try {
      setRefreshing(true);
      const response = await storeApi.getServiceOrder(orderId);
      setOrder(response);
    } catch (err) {
      console.error('Failed to refresh order:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    return STATUS_STEPS.findIndex((step) => step.key === status);
  };

  const isStepCompleted = (stepIndex: number, currentStatus: string) => {
    return stepIndex <= getCurrentStepIndex(currentStatus);
  };

  const getEstimatedCompletion = () => {
    if (!order) return null;

    if (order.estimated_completion) {
      return new Date(order.estimated_completion);
    }

    if (order.accepted_at && order.quote.estimated_time_hours) {
      const acceptedDate = new Date(order.accepted_at);
      const estimatedDate = new Date(
        acceptedDate.getTime() + order.quote.estimated_time_hours * 60 * 60 * 1000,
      );
      return estimatedDate;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const estimatedCompletion = getEstimatedCompletion();
  const currentStepIndex = getCurrentStepIndex(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{orderId.slice(-8)}</h1>
              <p className="text-gray-600 mt-2">
                {order.quote.service_type === 'printing' ? '3D Printing' : 'Laser Engraving'} Order
              </p>
            </div>

            <button
              onClick={refreshOrder}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              {order.quote.service_type === 'printing' ? (
                <Printer className="h-8 w-8 text-blue-500 mr-3" />
              ) : (
                <Scissors className="h-8 w-8 text-purple-500 mr-3" />
              )}
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-semibold">
                  {order.quote.service_type === 'printing' ? '3D Printing' : 'Laser Engraving'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold">
                  {formatPrice(order.quote.price, order.quote.currency)}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Ordered</p>
                <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Material:</span>
              <span className="ml-2 font-medium">{order.quote.material}</span>
            </div>
            <div>
              <span className="text-gray-600">Quantity:</span>
              <span className="ml-2 font-medium">{order.quote.quantity}</span>
            </div>
            <div>
              <span className="text-gray-600">Est. Time:</span>
              <span className="ml-2 font-medium">{order.quote.estimated_time_hours}h</span>
            </div>
            <div>
              <span className="text-gray-600">Delivery:</span>
              <span className="ml-2 font-medium capitalize">{order.delivery_method}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'completed' || order.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'accepted'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = isStepCompleted(index, order.status);
                  const isCurrent = index === currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="relative">
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className={`absolute left-4 top-8 h-16 w-px ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      )}

                      <div className="flex items-start">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3
                              className={`text-sm font-medium ${
                                isCompleted
                                  ? 'text-green-900'
                                  : isCurrent
                                    ? 'text-blue-900'
                                    : 'text-gray-500'
                              }`}
                            >
                              {step.label}
                            </h3>
                            {isCurrent && (
                              <span className="text-xs text-blue-600 font-medium">Current</span>
                            )}
                          </div>
                          <p
                            className={`mt-1 text-sm ${
                              isCompleted
                                ? 'text-green-700'
                                : isCurrent
                                  ? 'text-blue-700'
                                  : 'text-gray-500'
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimated Completion */}
              {estimatedCompletion &&
                order.status !== 'completed' &&
                order.status !== 'delivered' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Estimated Completion</p>
                        <p className="text-sm text-blue-700">
                          {estimatedCompletion.toLocaleDateString()} at{' '}
                          {estimatedCompletion.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Status Messages */}
            {order.status_messages && order.status_messages.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Updates</h3>
                <div className="space-y-4">
                  {order.status_messages.reverse().map((message, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{message.message}</p>
                        <span className="text-sm text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {message.images && message.images.length > 0 && (
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {message.images.map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image}
                              alt="Update"
                              className="w-full h-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Provider Info & Actions */}
          <div className="space-y-6">
            {/* Provider Information */}
            {order.provider && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Provider</h3>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{order.provider.business_name}</p>
                      <p className="text-sm text-gray-600">{order.provider.contact_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.provider.rating.toFixed(1)} Rating
                      </p>
                      <p className="text-sm text-gray-600">Based on customer reviews</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">{order.provider.address}</p>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="pt-4 border-t space-y-3">
                    {order.provider.email && (
                      <a
                        href={`mailto:${order.provider.email}`}
                        className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                      >
                        <Mail className="h-4 w-4 mr-3" />
                        Send Email
                      </a>
                    )}

                    {order.provider.phone && (
                      <a
                        href={`tel:${order.provider.phone}`}
                        className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                      >
                        <Phone className="h-4 w-4 mr-3" />
                        Call Provider
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

              <div className="space-y-3">
                <button className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg">
                  <MessageSquare className="h-4 w-4 mr-3" />
                  Send Message
                </button>

                {order.status === 'delivered' && (
                  <Link
                    href={`/orders/${orderId}/review`}
                    className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                  >
                    <Star className="h-4 w-4 mr-3" />
                    Write Review
                  </Link>
                )}

                <button className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg">
                  <Package className="h-4 w-4 mr-3" />
                  Order Details
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Our support team is here to help with any questions about your order.
              </p>
              <Link
                href="/support"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
