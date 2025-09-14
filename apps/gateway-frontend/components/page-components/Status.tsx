'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  Activity,
  Server,
  Globe,
  Database,
  Zap,
  Shield,
  RefreshCw,
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage';
  description: string;
  uptime: number;
  responseTime: number;
  lastChecked: string;
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  startTime: string;
  resolvedTime?: string;
  updates: IncidentUpdate[];
}

interface IncidentUpdate {
  time: string;
  message: string;
  status: string;
}

export default function Status() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Simulate real-time status updates
    const fetchStatus = () => {
      setServices([
        {
          name: 'MakrX Gateway',
          status: 'operational',
          description: 'Main website and authentication',
          uptime: 99.97,
          responseTime: 156,
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'MakrCave Platform',
          status: 'operational',
          description: 'Makerspace management and booking system',
          uptime: 99.95,
          responseTime: 234,
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'MakrX Store',
          status: 'operational',
          description: 'E-commerce and custom manufacturing orders',
          uptime: 99.92,
          responseTime: 187,
          lastChecked: new Date().toISOString(),
        },
        {
          name: '3D.MakrX.Store',
          status: 'operational',
          description: '3D printing and fabrication services',
          uptime: 99.89,
          responseTime: 298,
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'API Gateway',
          status: 'operational',
          description: 'REST and GraphQL APIs',
          uptime: 99.98,
          responseTime: 89,
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'File Storage',
          status: 'operational',
          description: 'Design files and asset storage',
          uptime: 99.99,
          responseTime: 67,
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Payment Processing',
          status: 'operational',
          description: 'Billing and payment systems',
          uptime: 99.96,
          responseTime: 145,
          lastChecked: new Date().toISOString(),
        },
        {
          name: 'Notification Service',
          status: 'operational',
          description: 'Email, SMS, and push notifications',
          uptime: 99.94,
          responseTime: 123,
          lastChecked: new Date().toISOString(),
        },
      ]);

      setIncidents([
        {
          id: '1',
          title: 'API Rate Limiting Improvements',
          status: 'resolved',
          severity: 'minor',
          description:
            'Implemented enhanced rate limiting to improve API stability during peak hours.',
          startTime: '2024-01-18T10:30:00Z',
          resolvedTime: '2024-01-18T11:45:00Z',
          updates: [
            {
              time: '2024-01-18T11:45:00Z',
              message:
                'Rate limiting has been successfully implemented. All services are operating normally.',
              status: 'resolved',
            },
            {
              time: '2024-01-18T11:15:00Z',
              message: 'Deployment in progress. Some users may experience brief slowdowns.',
              status: 'monitoring',
            },
            {
              time: '2024-01-18T10:30:00Z',
              message: 'Starting deployment of new rate limiting system to improve API stability.',
              status: 'identified',
            },
          ],
        },
      ]);

      setLastUpdated(new Date().toISOString());
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'partial_outage':
        return <XCircle className="w-5 h-5 text-orange-500" />;
      case 'major_outage':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 dark:text-green-400';
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'partial_outage':
        return 'text-orange-600 dark:text-orange-400';
      case 'major_outage':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getIncidentSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'major':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'minor':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'monitoring':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'identified':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'investigating':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const overallStatus = services.every((s) => s.status === 'operational')
    ? 'operational'
    : 'degraded';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-makrx-blue to-purple-900 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            {getStatusIcon(overallStatus)}
            <h1 className="text-4xl md:text-5xl font-bold text-white">System Status</h1>
          </div>
          <p className="text-xl text-white/90 mb-8">
            Real-time status and performance monitoring for all MakrX services
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <Activity className="w-5 h-5 text-white" />
            <span className="text-white">
              All systems operational • Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </section>

      {/* Current Status */}
      <section className="py-20 -mt-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Current Status</h2>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-makrx-blue dark:hover:text-makrx-yellow transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            <div className="grid gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {service.uptime}% uptime
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {service.responseTime}ms
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avg response</p>
                    </div>
                    <div className="text-right min-w-0">
                      <p
                        className={`text-sm font-medium capitalize ${getStatusColor(service.status)}`}
                      >
                        {service.status.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(service.lastChecked).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Performance Overview
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">99.96%</h3>
              <p className="text-gray-600 dark:text-gray-300">Overall Uptime</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 30 days</p>
            </div>

            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">164ms</h3>
              <p className="text-gray-600 dark:text-gray-300">Avg Response Time</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Global average</p>
            </div>

            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">0</h3>
              <p className="text-gray-600 dark:text-gray-300">Security Incidents</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 90 days</p>
            </div>

            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">12</h3>
              <p className="text-gray-600 dark:text-gray-300">Global Regions</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CDN endpoints</p>
            </div>
          </div>
        </div>
      </section>

      {/* Incident History */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Recent Incidents
          </h2>

          {incidents.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Recent Incidents
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All systems have been running smoothly.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getIncidentSeverityColor(incident.severity)}`}
                        >
                          {incident.severity.toUpperCase()}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getIncidentStatusColor(incident.status)}`}
                        >
                          {incident.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {incident.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">{incident.description}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                      <p>Started: {new Date(incident.startTime).toLocaleString()}</p>
                      {incident.resolvedTime && (
                        <p>Resolved: {new Date(incident.resolvedTime).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Updates:</h4>
                    {incident.updates.map((update, updateIndex) => (
                      <div
                        key={updateIndex}
                        className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(update.time).toLocaleString()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getIncidentStatusColor(update.status)}`}
                            >
                              {update.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{update.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-20 bg-makrx-blue dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Stay Informed</h2>
          <p className="text-xl text-white/90 mb-8">
            Subscribe to get real-time notifications about service status and planned maintenance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-makrx-yellow bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button className="px-6 py-3 bg-makrx-yellow text-makrx-blue font-semibold rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
