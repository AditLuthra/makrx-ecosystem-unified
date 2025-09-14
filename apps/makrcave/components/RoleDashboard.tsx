'use client';

import { useKeycloak } from '@makrx/auth';
import NotificationWidget from './NotificationWidget';
import AnalyticsWidget from './AnalyticsWidget';
import ServiceProviderDashboard from './ServiceProviderDashboard';
import {
  Crown,
  Shield,
  Wrench,
  Settings,
  UserCheck,
  BarChart3,
  Users,
  Building2,
  Package,
  FolderOpen,
  Calendar,
  AlertTriangle,
  Activity,
} from 'lucide-react';

// Super Admin Dashboard
function SuperAdminDashboard() {
  const { user } = useKeycloak();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 sm:gap-4">
          <Crown className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">Super Admin Console</h1>
            <p className="text-purple-100 text-sm sm:text-base">
              Welcome back, {user?.firstName}! You have full system access.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Makerspaces
              </p>
              <p className="text-xl sm:text-2xl font-bold">12</p>
            </div>
            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">System Users</p>
              <p className="text-xl sm:text-2xl font-bold">1,248</p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Equipment
              </p>
              <p className="text-xl sm:text-2xl font-bold">156</p>
            </div>
            <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Active Projects
              </p>
              <p className="text-xl sm:text-2xl font-bold">89</p>
            </div>
            <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 text-makrx-teal flex-shrink-0" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="makrcave-card">
          <h3 className="text-lg font-semibold mb-4">System Overview</h3>
          <p className="text-muted-foreground">
            As a Super Admin, you have complete control over the MakrX ecosystem including
            creating/deleting makerspaces, managing all users, viewing system logs, and configuring
            feature flags.
          </p>
        </div>

        <NotificationWidget category="system" title="System Notifications" maxItems={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationWidget category="inventory" title="Inventory Alerts" maxItems={4} />

        <NotificationWidget title="Recent Activity" maxItems={4} />
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const { user } = useKeycloak();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 sm:gap-4">
          <Shield className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">Organization Admin</h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Welcome, {user?.firstName}! Manage users and view organization data.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Managed Users</p>
              <p className="text-2xl font-bold">324</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role Assignments</p>
              <p className="text-2xl font-bold">45</p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Analytics Reports</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <BarChart3 className="w-8 h-8 text-makrx-teal" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="makrcave-card">
          <h3 className="text-lg font-semibold mb-4">Access Limitations</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> As an Admin, you can view all makerspaces and manage users, but
              you cannot modify makerspace-level inventory or equipment. Contact a Super Admin for
              advanced system changes.
            </p>
          </div>
        </div>

        <NotificationWidget category="inventory" title="Inventory Alerts" maxItems={4} />
      </div>

      <NotificationWidget title="Recent Notifications" maxItems={5} />
    </div>
  );
}

// Makerspace Admin Dashboard
function MakerspaceAdminDashboard() {
  const { user } = useKeycloak();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-makrx-teal to-teal-600 dark:from-makrx-teal dark:to-teal-700 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 sm:gap-4">
          <Building2 className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">Makerspace Console</h1>
            <p className="text-teal-100 text-sm sm:text-base">
              Welcome back, {user?.firstName}! Manage your makerspace operations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Members</p>
              <p className="text-xl sm:text-2xl font-bold">86</p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Equipment Items</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <Wrench className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inventory Items</p>
              <p className="text-2xl font-bold">342</p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">$2,845</p>
            </div>
            <BarChart3 className="w-8 h-8 text-makrx-teal" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsWidget title="Equipment Analytics" />
        <NotificationWidget category="equipment" title="Equipment Status" maxItems={4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationWidget category="inventory" title="Low Stock Alerts" maxItems={5} />
        <NotificationWidget category="equipment" title="Today's Reservations" maxItems={5} />
      </div>
    </div>
  );
}

// Default Role Dashboard
function DefaultDashboard() {
  const { user } = useKeycloak();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <UserCheck className="w-12 h-12" />
          <div>
            <h1 className="text-2xl font-bold">Welcome to MakrCave</h1>
            <p className="text-gray-100">
              Hello, {user?.firstName}! Explore makerspaces and manage your projects.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">My Projects</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <FolderOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reservations</p>
              <p className="text-2xl font-bold">2</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="makrcave-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Certifications</p>
              <p className="text-2xl font-bold">1</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="makrcave-card">
          <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
          <p className="text-muted-foreground mb-4">
            Welcome to MakrCave! Start by exploring makerspaces near you, booking equipment, and
            connecting with the maker community.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Complete your profile</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Find makerspaces near you</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Book your first equipment session</span>
            </div>
          </div>
        </div>

        <NotificationWidget title="Recent Activity" maxItems={4} />
      </div>
    </div>
  );
}

export default function RoleDashboard() {
  const { user, hasRole } = useKeycloak();

  if (!user) {
    return <DefaultDashboard />;
  }

  // Check roles using Keycloak hasRole function
  if (hasRole('super_admin') || hasRole('admin')) {
    return hasRole('super_admin') ? <SuperAdminDashboard /> : <AdminDashboard />;
  }

  if (hasRole('makerspace_admin')) {
    return <MakerspaceAdminDashboard />;
  }

  if (hasRole('service_provider')) {
    return <ServiceProviderDashboard />;
  }

  // Default dashboard for regular users
  return <DefaultDashboard />;
}
