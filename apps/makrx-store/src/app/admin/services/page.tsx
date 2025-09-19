'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Eye,
  Printer,
  Play,
  Pause,
  Check,
  X,
  Clock,
  Settings,
  FileText,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';

import { storeApi } from '@/services/storeApi';

interface ServiceJob {
  id: string;
  jobNumber: string;
  customerName: string;
  customerEmail: string;
  service: string;
  fileName: string;
  material: string;
  quantity: number;
  status: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  dateSubmitted: string;
  estimatedCompletion?: string;
  actualCompletion?: string;
  printTime?: string;
  price: number;
  specifications: {
    layerHeight: string;
    infill: string;
    supports: boolean;
    quality: string;
  };
  progress?: number;
  notes?: string;
  currency?: string;
}

const getProgressFromStatus = (status: string): number => {
  const normalized = status?.toLowerCase();

  if (!normalized) return 0;

  if (['completed', 'delivered', 'shipped'].includes(normalized)) {
    return 100;
  }
  if (['post-processing', 'quality-check', 'in_production', 'ready'].includes(normalized)) {
    return 80;
  }
  if (['printing', 'in_progress', 'accepted', 'production'].includes(normalized)) {
    return 60;
  }
  if (['queued', 'pending', 'dispatched', 'routed'].includes(normalized)) {
    return 30;
  }
  if (['failed', 'cancelled'].includes(normalized)) {
    return 0;
  }

  return 50;
};

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

export default function AdminServices() {
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateSubmitted');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await storeApi.getProviderJobs();
      const rawJobs: any[] = Array.isArray(response?.jobs) ? response.jobs : Array.isArray(response) ? response : [];

      const mapped: ServiceJob[] = rawJobs.map((job, index) => {
        const id = job.id ? String(job.id) : `job-${index}`;
        const submittedAt = job.accepted_at ?? job.created_at ?? new Date().toISOString();
        const priority = (job.priority?.toLowerCase?.() || 'normal') as ServiceJob['priority'];
        const status = job.status ?? 'queued';
        const specs = job.specifications ?? {};

        const rawService = (job.service_type ?? job.service ?? 'Service').replace(/_/g, ' ');
        const serviceName = rawService
          .split(' ')
          .filter(Boolean)
                    .map((segment: string) => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(' ');

        const layerHeight = specs.layerHeight ?? specs.layer_height;
        const infill = specs.infill ?? specs.infill_percentage;

        return {
          id,
          jobNumber: job.service_order_number ?? job.job_number ?? id,
          customerName: job.customer_name ?? job.customer_id ?? '—',
          customerEmail: job.customer_email ?? '—',
          service: serviceName,
          fileName: job.file_name ?? (job.file_url ? job.file_url.split('/').pop() : '—'),
          material: job.material ?? '—',
          quantity: job.quantity ?? 1,
          status,
          priority: ['low', 'normal', 'high', 'urgent'].includes(priority) ? priority : 'normal',
          assignedTo: job.assigned_to ?? job.assigned_station ?? undefined,
          dateSubmitted: submittedAt,
          estimatedCompletion: job.estimated_completion ?? undefined,
          actualCompletion: job.actual_completion ?? job.completed_at ?? undefined,
          printTime: job.print_time ?? undefined,
          price: typeof job.price === 'number' ? job.price : 0,
          specifications: {
            layerHeight: layerHeight != null ? String(layerHeight) : '—',
            infill: infill != null ? String(infill) : '—',
            supports: Boolean(job.supports ?? specs.supports ?? false),
            quality: specs.quality ?? job.quality ?? 'Standard',
          },
          progress: getProgressFromStatus(status),
          notes: job.customer_notes ?? job.provider_notes ?? undefined,
          currency: job.currency ?? 'INR',
        };
      });

      setJobs(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load provider jobs';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredAndSortedJobs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      const fields = [job.customerName, job.customerEmail, job.jobNumber, job.fileName]
        .filter(Boolean)
        .map((value) => value!.toLowerCase());

      const matchesSearch =
        !normalizedSearch || fields.some((value) => value.includes(normalizedSearch));
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesService = serviceFilter === 'all' || job.service === serviceFilter;
      const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesService && matchesPriority;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ServiceJob];
      let bValue: any = b[sortBy as keyof ServiceJob];

      if (sortBy === 'dateSubmitted' || sortBy === 'estimatedCompletion') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }

      return aValue < bValue ? 1 : -1;
    });
  }, [jobs, searchTerm, statusFilter, serviceFilter, priorityFilter, sortBy, sortOrder]);

  const currency = jobs[0]?.currency ?? 'INR';
  const queuedCount = jobs.filter((job) => job.status?.toLowerCase() === 'queued').length;
  const inProgressCount = jobs.filter((job) =>
    ['printing', 'post-processing', 'quality-check', 'in_progress', 'in production'].includes(
      job.status?.toLowerCase?.() ?? '',
    ),
  ).length;
  const completedCount = jobs.filter((job) => job.status?.toLowerCase() === 'completed').length;
  const issueCount = jobs.filter((job) =>
    ['failed', 'cancelled'].includes(job.status?.toLowerCase() ?? ''),
  ).length;
  const revenue = jobs
    .filter((job) => job.status?.toLowerCase() === 'completed')
    .reduce((sum, job) => sum + (job.price || 0), 0);

  const statusOptions = useMemo(() => {
    const values = new Set<string>();
    jobs.forEach((job) => {
      if (job.status) {
        values.add(job.status);
      }
    });
    return Array.from(values);
  }, [jobs]);

  const serviceOptions = useMemo(() => {
    const values = new Set<string>();
    jobs.forEach((job) => {
      if (job.service) {
        values.add(job.service);
      }
    });
    return Array.from(values);
  }, [jobs]);

  const getStatusIcon = (status: ServiceJob['status']) => {
    const normalized = status?.toLowerCase() ?? '';

    switch (normalized) {
      case 'printing':
      case 'in_progress':
      case 'in production':
        return <Printer className="w-4 h-4" />;
      case 'post-processing':
      case 'quality-check':
        return <Settings className="w-4 h-4" />;
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'failed':
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ServiceJob['status']) => {
    const normalized = status?.toLowerCase() ?? '';

    switch (normalized) {
      case 'queued':
        return 'bg-gray-100 text-gray-800';
      case 'printing':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'post-processing':
      case 'quality-check':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ServiceJob['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId],
    );
  };

  const handleSelectAll = () => {
    setSelectedJobs(
      selectedJobs.length === filteredAndSortedJobs.length
        ? []
        : filteredAndSortedJobs.map((job) => job.id),
    );
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-600">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Loading service jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load service jobs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadJobs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Jobs</h1>
              <p className="text-gray-600 mt-2">Manage 3D printing, CNC, and laser cutting jobs</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Queued</p>
                <p className="text-2xl font-bold text-gray-900">{queuedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Printer className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Issues</p>
                <p className="text-2xl font-bold text-gray-900">{issueCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue, currency)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs, customers, files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Services</option>
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedJobs.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                {selectedJobs.length} job(s) selected
              </span>
              <div className="flex items-center space-x-3">
                <button className="px-3 py-1 text-blue-700 hover:bg-blue-100 rounded">
                  Update Status
                </button>
                <button className="px-3 py-1 text-blue-700 hover:bg-blue-100 rounded">
                  Assign Technician
                </button>
                <button className="px-3 py-1 text-blue-700 hover:bg-blue-100 rounded">
                  Export Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedJobs.length === filteredAndSortedJobs.length &&
                        filteredAndSortedJobs.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('jobNumber')}
                  >
                    <div className="flex items-center">
                      Job
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center">
                      Customer
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File & Service
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('dateSubmitted')}
                  >
                    <div className="flex items-center">
                      Submitted
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedJobs.map((job) => {
                  const progressValue = typeof job.progress === 'number' ? job.progress : 0;
                  const progressLabel = typeof job.progress === 'number' ? `${job.progress}%` : '—';
                  const priceLabel = formatCurrency(job.price || 0, job.currency ?? currency);
                  const statusLabel = job.status ? job.status.replace(/_/g, ' ') : '—';

                  return (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={() => handleSelectJob(job.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.jobNumber}</div>
                        <div className="text-sm text-gray-500">
                          {job.quantity} × {job.material}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.customerName}</div>
                        <div className="text-sm text-gray-500">{job.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.fileName}</div>
                        <div className="text-sm text-gray-500">{job.service}</div>
                        {job.assignedTo && (
                          <div className="text-sm text-blue-600">{job.assignedTo}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(job.dateSubmitted)}
                      </div>
                      {job.estimatedCompletion && (
                        <div className="text-sm text-gray-500">
                          Est: {formatDateTime(job.estimatedCompletion)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}
                      >
                        {getStatusIcon(job.status)}
                        <span className="ml-1 capitalize">{statusLabel}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${progressValue}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{progressLabel}</span>
                      </div>
                      {job.printTime && (
                        <div className="text-sm text-gray-500 mt-1">{job.printTime}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getPriorityColor(job.priority)}`}
                      >
                        {job.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{priceLabel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/services/${job.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {job.status === 'printing' && (
                          <button className="text-orange-600 hover:text-orange-900">
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {job.status === 'queued' && (
                          <button className="text-green-600 hover:text-green-900">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSortedJobs.length === 0 && (
            <div className="text-center py-12">
              <Printer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No service jobs found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredAndSortedJobs.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {filteredAndSortedJobs.length} of {jobs.length} jobs
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
