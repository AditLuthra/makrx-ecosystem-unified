'use client';
export const dynamic = 'force-dynamic';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Settings,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import AddMemberModal from '../../components/modals/AddMemberModal';
import EditMemberModal from '../../components/modals/EditMemberModal';
import InviteMemberModal from '../../components/modals/InviteMemberModal';
import MemberDetailsModal from '../../components/modals/MemberDetailsModal';
import MembershipPlanModal from '../../components/modals/MembershipPlanModal';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Member, useMembers } from '../../contexts/MemberContext';

const Members: React.FC = () => {
  const {
    members,
    memberStats,
    loading,
    error,
    membershipPlans,
    invites,
    removeMember,
    suspendMember,
    reactivateMember,
    searchMembers,
    filterMembers,
  } = useMembers();

  const safeMembers = Array.isArray(members) ? members : [];
  const safeMembershipPlans = Array.isArray(membershipPlans) ? membershipPlans : [];
  const safeInvites = Array.isArray(invites) ? invites : [];

  const resolveCount = (value: unknown, fallback = 0) =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;

  const memberSummary = {
    total: resolveCount(memberStats?.total, safeMembers.length),
    active: resolveCount(memberStats?.active),
    expired: resolveCount(memberStats?.expired),
    pending: resolveCount(memberStats?.pending),
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState('members');

  // Apply filters
  const filteredMembers = React.useMemo(() => {
    const filtered = filterMembers({
      status: statusFilter === 'all' ? undefined : statusFilter,
      role: roleFilter === 'all' ? undefined : roleFilter,
      plan: planFilter === 'all' ? undefined : planFilter,
    });
    const safeFiltered = Array.isArray(filtered) ? filtered : safeMembers;

    if (!searchQuery) {
      return safeFiltered;
    }

    const searchResults = searchMembers(searchQuery);
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : safeMembers;
    const allowedIds = new Set(safeFiltered.map((member) => member.id));

    return safeSearchResults.filter((member) => allowedIds.has(member.id));
  }, [
    filterMembers,
    planFilter,
    roleFilter,
    safeMembers,
    searchMembers,
    searchQuery,
    statusFilter,
  ]);

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  const handleSuspendMember = async (member: Member) => {
    if (
      window.confirm(`Are you sure you want to suspend ${member.firstName} ${member.lastName}?`)
    ) {
      try {
        await suspendMember(member.id);
      } catch (err) {
        console.error('Failed to suspend member:', err);
      }
    }
  };

  const handleReactivateMember = async (member: Member) => {
    try {
      await reactivateMember(member.id);
    } catch (err) {
      console.error('Failed to reactivate member:', err);
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (
      window.confirm(
        `Are you sure you want to permanently remove ${member.firstName} ${member.lastName}? This action cannot be undone.`,
      )
    ) {
      try {
        await removeMember(member.id);
      } catch (err) {
        console.error('Failed to remove member:', err);
      }
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Unknown
        </Badge>
      );
    }

    const variants = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge
        variant="outline"
        className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role?: string) => {
    if (!role) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Member
        </Badge>
      );
    }

    const variants = {
      user: 'bg-blue-100 text-blue-800',
      service_provider: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      makerspace_admin: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge
        variant="outline"
        className={variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800'}
      >
        {role === 'service_provider'
          ? 'Service Provider'
          : role === 'makerspace_admin'
            ? 'Manager'
            : role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
          <p className="text-gray-600">Manage makerspace members, plans, and access</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowInviteModal(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Send Invite
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{memberSummary.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{memberSummary.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{memberSummary.expired}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{memberSummary.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="plans">Membership Plans</TabsTrigger>
          <TabsTrigger value="invites">Pending Invites</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search members by name, email, or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="service_provider">Service Provider</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="makerspace_admin">Manager</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      {safeMembershipPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Members ({filteredMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No members found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMembers.map((member) => {
                    const firstName = member.firstName ?? member.first_name ?? '';
                    const lastName = member.lastName ?? member.last_name ?? '';
                    const displayName = [firstName, lastName].filter(Boolean).join(' ') || member.name;
                    const primaryInitial = (firstName || member.name || '?').charAt(0) || '?';
                    const secondaryInitial = (lastName || '').charAt(0) || '';
                    const initials = `${primaryInitial}${secondaryInitial}`.trim() || primaryInitial || '?';
                    const email = member.email ?? 'Not provided';
                    const planName = member.membership_plan_name ?? 'No plan assigned';
                    const projectsCount = resolveCount(member.projects_count);
                    const reservationsCount = resolveCount(member.reservations_count);
                    const joinDateLabel =
                      member.join_date && !Number.isNaN(Date.parse(member.join_date))
                        ? new Date(member.join_date).toLocaleDateString()
                        : '—';

                    return (
                      <div
                        key={member.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-lg font-semibold text-blue-700">{initials}</span>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{displayName}</h3>
                                {member.role === 'admin' && (
                                  <Crown className="h-4 w-4 text-yellow-600" />
                                )}
                                {getStatusIcon(member.status)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {email}
                                </span>
                                {member.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {member.phone}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Joined {joinDateLabel}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {getStatusBadge(member.status)}
                                {getRoleBadge(member.role)}
                                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                  {planName}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <p className="font-medium text-gray-900">{projectsCount} projects</p>
                              <p className="text-gray-600">{reservationsCount} reservations</p>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                  Edit Member
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {member.status === 'suspended' ? (
                                  <DropdownMenuItem onClick={() => handleReactivateMember(member)}>
                                    Reactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleSuspendMember(member)}>
                                    Suspend
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleRemoveMember(member)}
                                  className="text-red-600"
                                >
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Membership Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Membership Plans</h2>
            <Button onClick={() => setShowPlanModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeMembershipPlans.map((plan) => {
              const features = Array.isArray(plan.features) ? plan.features : [];
              const priceDisplay =
                typeof plan.price === 'number' && Number.isFinite(plan.price)
                  ? `$${plan.price.toFixed(2)}`
                  : 'Contact us';
              const description = plan.description || 'No description provided';
              const durationLabel =
                typeof plan.duration_days === 'number' && Number.isFinite(plan.duration_days)
                  ? `${plan.duration_days} days`
                  : 'Flexible';
              const membersOnPlan = safeMembers.filter(
                (member) => member.membership_plan_id === plan.id,
              ).length;

              return (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name || 'Untitled plan'}</CardTitle>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {priceDisplay}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{durationLabel}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Features:</p>
                        <ul className="text-sm space-y-1">
                          {features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center text-gray-700">
                              <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                              {feature || 'Not specified'}
                            </li>
                          ))}
                          {features.length === 0 && (
                            <li className="text-gray-500">No features listed</li>
                          )}
                          {features.length > 3 && (
                            <li className="text-gray-500 text-xs">
                              +{features.length - 3} more features
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-gray-600">
                          {membersOnPlan} member{membersOnPlan === 1 ? '' : 's'}
                        </span>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pending Invites</h2>
            <Button onClick={() => setShowInviteModal(true)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              {safeInvites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pending invites</p>
                  <p className="text-sm">Send invites to new members to join your makerspace</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeInvites.map((invite) => {
                    const roleLabel = invite.role ?? 'user';
                    const planName =
                      safeMembershipPlans.find((plan) => plan.id === invite.membership_plan_id)?.name ??
                      'No plan selected';
                    const statusLabel = invite.status ?? 'pending';
                    const expiresLabel =
                      invite.expires_at && !Number.isNaN(Date.parse(invite.expires_at))
                        ? new Date(invite.expires_at).toLocaleDateString()
                        : '—';

                    return (
                      <div key={invite.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{invite.email}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Role: {roleLabel}</span>
                              <span>•</span>
                              <span>Plan: {planName}</span>
                              <span>•</span>
                              <span>Expires: {expiresLabel}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Resend Invite</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  Cancel Invite
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddMemberModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        membershipPlans={safeMembershipPlans}
      />

      <EditMemberModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        member={selectedMember}
        membershipPlans={safeMembershipPlans}
      />

      <MembershipPlanModal open={showPlanModal} onOpenChange={setShowPlanModal} />

      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        membershipPlans={safeMembershipPlans}
      />

      <MemberDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        member={selectedMember}
      />
    </div>
  );
};

export default function MembersPage() {
  if (typeof window === 'undefined') {
    return null;
  }
  return <Members />;
}
