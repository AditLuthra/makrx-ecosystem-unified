'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
// Using div-based table for now - will be replaced with proper table component
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { Crown, Filter, Search, Shield, User, UserCheck, Users, UserX } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'user' | 'event_admin' | 'super_admin';
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingApplications: number;
  eventAdmins: number;
}

function AdminUsersPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/admin/users/stats'],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      return await apiRequest('PATCH', `/api/admin/users/${userId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/stats'] });
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === '' ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserMutation.mutate({ userId, updates: { role: newRole as User['role'] } });
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    updateUserMutation.mutate({ userId, updates: { status: newStatus as User['status'] } });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'event_admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'event_admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-xl text-muted-foreground">
            Manage platform users and their permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.eventAdmins || 0}</div>
            <p className="text-xs text-muted-foreground">Admin users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="event_admin">Event Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Joined</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <div>
                            <div className="font-medium">
                              {user.firstName || user.lastName
                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                : 'No name'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </td>
                      <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="event_admin">Event Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={user.status}
                            onValueChange={(newStatus) => handleStatusChange(user.id, newStatus)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminUsersPage() {
  // SSR/SSG or mock mode: return static fallback UI
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Admin Users (Static Export)</h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a static fallback. User management and dynamic data are disabled in static export.
        </p>
      </div>
    );
  }

  return <AdminUsersPageContent />;
}
