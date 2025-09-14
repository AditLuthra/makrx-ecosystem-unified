"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap,
  Users,
  Award,
  Search,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  User,
  Shield,
  Star,
  Wrench,
  Eye,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

// Import all the new modals
import CertifyMemberModal from '../../components/modals/CertifyMemberModal';
import SkillRequirementsModal from '../../components/modals/SkillRequirementsModal';
import RevokeSkillModal from '../../components/modals/RevokeSkillModal';
import AddSkillModal from '../../components/modals/AddSkillModal';
import SkillDetailsModal from '../../components/modals/SkillDetailsModal';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  prerequisites: string[];
  equipment: string[];
  status: 'active' | 'disabled';
}

interface UserSkill {
  userId: string;
  userName: string;
  userEmail: string;
  skillId: string;
  skillName: string;
  status: 'pending' | 'certified' | 'expired' | 'revoked';
  certifiedAt?: string;
  expiresAt?: string;
  certifiedBy: string;
  notes?: string;
}

const SkillManagement: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  
  // All hooks must be at the top
  const [activeTab, setActiveTab] = useState('certifications');
  const [searchTerm, setSearchTerm] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [certifyModalOpen, setCertifyModalOpen] = useState(false);
  const [skillRequirementsModalOpen, setSkillRequirementsModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [skillDetailsModalOpen, setSkillDetailsModalOpen] = useState(false);

  // Selected items for modals
  const [selectedUserSkill, setSelectedUserSkill] = useState<UserSkill | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');

  // Mock data for members and equipment
  const mockMembers = [
    { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
    { id: 'user-2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' }
  ];

  const mockEquipment = [
    { id: 'eq-1', name: '3D Printer Pro', type: 'printer_3d' },
    { id: 'eq-2', name: 'Laser Cutter X1', type: 'laser_cutter' }
  ];

  const mockSkills = [
    {
      id: 'skill-1',
      name: '3D Printing',
      category: 'manufacturing',
      description: 'Basic 3D printing skills',
      level: 'beginner' as const,
      equipment_ids: ['eq-1'],
      requirements: ['Complete safety training'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }
  ];

  const mockUserSkills = [
    {
      id: 'user-skill-1',
      user_id: 'user-1',
      skill_id: 'skill-1',
      status: 'certified' as const,
      certifiedAt: '2023-06-01T10:00:00Z',
      expiresAt: '2024-06-01T10:00:00Z',
      certifiedBy: 'Tech Lead',
      notes: 'Needs recertification'
    }
  ];

  useEffect(() => {
    // Initialize mock data
    setSkills(mockSkills);
    setUserSkills(mockUserSkills);
    setLoading(false);
  }, [mockSkills, mockUserSkills]);

  // Check if user has skill management access
  if (!hasPermission('admin', 'globalDashboard') && user?.role !== 'makerspace_admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You don't have permission to manage skills</p>
          <p className="text-sm text-gray-500">Contact your administrator for access</p>
        </div>
      </div>
    );
  }

  // getStatusBadge consolidated below

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'intermediate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // handleCertifyUser consolidated below

  // handleViewSkillDetails consolidated below

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'certified':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Certified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case 'revoked':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            <Shield className="h-3 w-3 mr-1" />
            Revoked
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      beginner: { color: 'bg-blue-100 text-blue-800', icon: '★' },
      intermediate: { color: 'bg-yellow-100 text-yellow-800', icon: '★★' },
      advanced: { color: 'bg-orange-100 text-orange-800', icon: '★★★' },
      expert: { color: 'bg-red-100 text-red-800', icon: '★★★★' }
    };
    
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.beginner;
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.icon} {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  // handleRevokeSkill consolidated below

  const handleSkillRequirements = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    setSkillRequirementsModalOpen(true);
  };

  const handleCertifyUser = (userSkillId: string) => {
    const userSkill = userSkills.find(us => `${us.userId}-${us.skillId}` === userSkillId);
    if (userSkill) {
      setSelectedUserSkill(userSkill);
      setCertifyModalOpen(true);
    }
  };

  const handleRevokeSkill = (userSkillId: string) => {
    const userSkill = userSkills.find(us => `${us.userId}-${us.skillId}` === userSkillId);
    if (userSkill) {
      setSelectedUserSkill(userSkill);
      setRevokeModalOpen(true);
    }
  };

  const handleViewSkillDetails = (skill: Skill) => {
    setSelectedSkill(skill);
    setSkillDetailsModalOpen(true);
  };

  const handleOpenCertifyModal = () => {
    setSelectedUserSkill(null);
    setCertifyModalOpen(true);
  };

  const handleOpenEquipmentRequirements = () => {
    setSkillRequirementsModalOpen(true);
  };

  const filteredUserSkills = userSkills.filter(us => 
    us.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    us.skillName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalSkills: skills.length,
    activeSkills: skills.filter(s => s.status === 'active').length,
    certifiedUsers: userSkills.filter(us => us.status === 'certified').length,
    pendingCertifications: userSkills.filter(us => us.status === 'pending').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Skill Management
          </h1>
          <p className="text-gray-600">Manage member certifications and skill levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleOpenEquipmentRequirements}>
            <Wrench className="h-4 w-4" />
            Equipment Requirements
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setAddSkillModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Skill
          </Button>
          <Button className="flex items-center gap-2" onClick={handleOpenCertifyModal}>
            <Award className="h-4 w-4" />
            Certify Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Skills</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSkills}</p>
                <p className="text-xs text-green-600">{stats.activeSkills} active</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certified Users</p>
                <p className="text-2xl font-bold text-green-600">{stats.certifiedUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingCertifications}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Skill Categories</p>
                <p className="text-2xl font-bold text-purple-600">4</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Certifications
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Available Skills
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Reviews
          </TabsTrigger>
        </TabsList>

        {/* User Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Member Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Member</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Skill</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Certified Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Expires</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUserSkills.map((userSkill, index) => (
                      <tr key={`${userSkill.userId}-${userSkill.skillId}`} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{userSkill.userName}</div>
                            <div className="text-sm text-gray-600">{userSkill.userEmail}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{userSkill.skillName}</div>
                          {userSkill.notes && (
                            <div className="text-sm text-gray-600">{userSkill.notes}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(userSkill.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {userSkill.certifiedAt ? new Date(userSkill.certifiedAt).toLocaleDateString() : '-'}
                          </div>
                          {userSkill.certifiedBy && (
                            <div className="text-xs text-gray-600">by {userSkill.certifiedBy}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {userSkill.expiresAt ? new Date(userSkill.expiresAt).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            {userSkill.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleCertifyUser(`${userSkill.userId}-${userSkill.skillId}`)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {userSkill.status === 'certified' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRevokeSkill(`${userSkill.userId}-${userSkill.skillId}`)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Revoke
                              </Button>
                            )}
                            {userSkill.status === 'expired' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCertifyUser(`${userSkill.userId}-${userSkill.skillId}`)}
                              >
                                <Award className="h-4 w-4 mr-1" />
                                Recertify
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredUserSkills.map((userSkill, index) => (
                  <div key={`${userSkill.userId}-${userSkill.skillId}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{userSkill.userName}</h4>
                        <p className="text-sm text-gray-600 truncate">{userSkill.userEmail}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {userSkill.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleCertifyUser(`${userSkill.userId}-${userSkill.skillId}`)}
                            className="text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        {userSkill.status === 'certified' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeSkill(`${userSkill.userId}-${userSkill.skillId}`)}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                        )}
                        {userSkill.status === 'expired' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCertifyUser(`${userSkill.userId}-${userSkill.skillId}`)}
                            className="text-xs"
                          >
                            <Award className="h-3 w-3 mr-1" />
                            Recertify
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs font-medium mb-1">Skill</p>
                        <p className="font-medium text-gray-900">{userSkill.skillName}</p>
                        {userSkill.notes && (
                          <p className="text-gray-600 text-xs mt-1">{userSkill.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-xs font-medium mb-1">Status</p>
                        {getStatusBadge(userSkill.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-gray-500 text-xs font-medium mb-1">Certified</p>
                        <p className="text-gray-900 text-xs">
                          {userSkill.certifiedAt ? new Date(userSkill.certifiedAt).toLocaleDateString() : '-'}
                        </p>
                        {userSkill.certifiedBy && (
                          <p className="text-gray-600 text-xs">by {userSkill.certifiedBy}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-xs font-medium mb-1">Expires</p>
                        <p className="text-gray-900 text-xs">
                          {userSkill.expiresAt ? new Date(userSkill.expiresAt).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <Card key={skill.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{skill.name}</CardTitle>
                    {getLevelBadge(skill.level)}
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {skill.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{skill.description}</p>
                  
                  {skill.prerequisites.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Prerequisites:</h4>
                      <div className="flex flex-wrap gap-1">
                        {skill.prerequisites.map((prereq, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {prereq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {skill.equipment.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Required Equipment:</h4>
                      <div className="flex flex-wrap gap-1">
                        {skill.equipment.map((equip, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                            {equip}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <Badge variant={skill.status === 'active' ? 'default' : 'secondary'}>
                      {skill.status}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => handleViewSkillDetails(skill)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Certification Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userSkills
                  .filter(us => us.status === 'pending')
                  .map((userSkill, index) => (
                    <div key={`${userSkill.userId}-${userSkill.skillId}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{userSkill.userName}</div>
                          <div className="text-sm text-gray-600">
                            Requesting certification for <strong>{userSkill.skillName}</strong>
                          </div>
                          {userSkill.notes && (
                            <div className="text-xs text-gray-500 mt-1">{userSkill.notes}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleCertifyUser(`${userSkill.userId}-${userSkill.skillId}`)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeSkill(`${userSkill.userId}-${userSkill.skillId}`)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* All Modals */}
      <CertifyMemberModal
        open={certifyModalOpen}
        onOpenChange={setCertifyModalOpen}
        members={mockMembers}
        skills={skills}
        existingCertification={selectedUserSkill ? {
          userId: selectedUserSkill.userId,
          skillId: selectedUserSkill.skillId,
          userName: selectedUserSkill.userName,
          skillName: selectedUserSkill.skillName,
          status: selectedUserSkill.status
        } : undefined}
      />

      <SkillRequirementsModal
        open={skillRequirementsModalOpen}
        onOpenChange={setSkillRequirementsModalOpen}
        equipment={mockEquipment}
        skills={skills}
        selectedEquipmentId={selectedEquipmentId}
      />

      {selectedUserSkill && (
        <RevokeSkillModal
          open={revokeModalOpen}
          onOpenChange={setRevokeModalOpen}
          userSkill={selectedUserSkill}
        />
      )}

      <AddSkillModal
        open={addSkillModalOpen}
        onOpenChange={setAddSkillModalOpen}
        equipment={mockEquipment}
        existingSkills={skills}
      />

      {selectedSkill && (
        <SkillDetailsModal
          open={skillDetailsModalOpen}
          onOpenChange={setSkillDetailsModalOpen}
          skill={selectedSkill}
          onEdit={() => {
            setSkillDetailsModalOpen(false);
            // You could open an edit modal here
            toast({
              title: "Edit Feature",
              description: "Edit functionality would be implemented here",
            });
          }}
          onDelete={() => {
            setSkillDetailsModalOpen(false);
            toast({
              title: "Skill Deleted",
              description: `${selectedSkill.name} has been removed`,
              variant: "destructive",
            });
          }}
        />
      )}
    </div>
  );
};

export default SkillManagement;
