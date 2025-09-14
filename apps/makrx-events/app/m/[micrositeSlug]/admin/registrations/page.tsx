import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Download,
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  Mail,
  UserCheck,
  Calendar,
  DollarSign,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface RegistrationsPageProps {
  params: {
    micrositeSlug: string;
  };
}

// Mock registrations data - replace with real API calls
async function getRegistrationsData(slug: string) {
  const mockData = {
    makerfest2024: {
      id: '1',
      slug: 'makerfest2024',
      title: 'MakerFest 2024',
      summary: {
        total: 1247,
        confirmed: 1089,
        checkedIn: 856,
        pending: 98,
        cancelled: 60,
        waitlist: 89,
      },
      registrations: [
        {
          id: 'reg_001',
          participantName: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1 (555) 0123',
          registrationDate: '2024-01-15T10:30:00Z',
          status: 'confirmed',
          paymentStatus: 'paid',
          amount: 45,
          eventName: 'Arduino Workshop',
          checkedInAt: '2024-03-15T09:15:00Z',
          attendeeType: 'General',
        },
        {
          id: 'reg_002',
          participantName: 'Mike Chen',
          email: 'mike.chen@email.com',
          phone: '+1 (555) 0124',
          registrationDate: '2024-01-18T14:22:00Z',
          status: 'confirmed',
          paymentStatus: 'free',
          amount: 0,
          eventName: '3D Printing Basics',
          checkedInAt: null,
          attendeeType: 'Student',
        },
        {
          id: 'reg_003',
          participantName: 'Emily Rodriguez',
          email: 'emily.r@company.com',
          phone: '+1 (555) 0125',
          registrationDate: '2024-01-20T16:45:00Z',
          status: 'pending',
          paymentStatus: 'pending',
          amount: 150,
          eventName: 'Robotics Competition',
          checkedInAt: null,
          attendeeType: 'Professional',
        },
        {
          id: 'reg_004',
          participantName: 'Alex Thompson',
          email: 'alex@startup.io',
          phone: '+1 (555) 0126',
          registrationDate: '2024-02-01T09:12:00Z',
          status: 'confirmed',
          paymentStatus: 'paid',
          amount: 25,
          eventName: 'IoT Hackathon',
          checkedInAt: '2024-03-15T08:45:00Z',
          attendeeType: 'Startup',
        },
        {
          id: 'reg_005',
          participantName: 'Lisa Park',
          email: 'lisa.park@university.edu',
          phone: '+1 (555) 0127',
          registrationDate: '2024-02-05T11:30:00Z',
          status: 'confirmed',
          paymentStatus: 'free',
          amount: 0,
          eventName: 'Sustainable Design',
          checkedInAt: null,
          attendeeType: 'Student',
        },
      ],
    },
  };

  return mockData[slug as keyof typeof mockData] || null;
}

const getStatusBadge = (status: string) => {
  const variants = {
    confirmed: { variant: 'default' as const, label: 'Confirmed' },
    pending: { variant: 'secondary' as const, label: 'Pending' },
    cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
    waitlist: { variant: 'outline' as const, label: 'Waitlisted' },
  };

  return (
    variants[status as keyof typeof variants] || { variant: 'outline' as const, label: status }
  );
};

const getPaymentBadge = (paymentStatus: string) => {
  const variants = {
    paid: { variant: 'default' as const, label: 'Paid', color: 'bg-green-100 text-green-800' },
    pending: {
      variant: 'secondary' as const,
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800',
    },
    free: { variant: 'outline' as const, label: 'Free', color: 'bg-gray-100 text-gray-800' },
    refunded: {
      variant: 'destructive' as const,
      label: 'Refunded',
      color: 'bg-red-100 text-red-800',
    },
  };

  return (
    variants[paymentStatus as keyof typeof variants] || {
      variant: 'outline' as const,
      label: paymentStatus,
      color: 'bg-gray-100 text-gray-800',
    }
  );
};

export default async function RegistrationsPage({ params }: RegistrationsPageProps) {
  const { micrositeSlug } = await params;
  const registrationsData = await getRegistrationsData(micrositeSlug);

  if (!registrationsData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-4">
                <Link href={`/m/${micrositeSlug}/admin`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {registrationsData.title} - Registrations
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Bulk Email
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrationsData.summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {registrationsData.summary.confirmed}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Checked In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {registrationsData.summary.checkedIn}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {registrationsData.summary.pending}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {registrationsData.summary.cancelled}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Waitlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {registrationsData.summary.waitlist}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or registration ID..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Registration Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="waitlist">Waitlisted</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="arduino">Arduino Workshop</SelectItem>
                  <SelectItem value="3d-printing">3D Printing Basics</SelectItem>
                  <SelectItem value="robotics">Robotics Competition</SelectItem>
                  <SelectItem value="iot">IoT Hackathon</SelectItem>
                  <SelectItem value="sustainable">Sustainable Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              All Registrations
            </CardTitle>
            <CardDescription>Manage participant registrations and check-in status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registrationsData.registrations.map((registration) => (
                <div key={registration.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {registration.participantName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{registration.participantName}</h4>
                          <Badge {...getStatusBadge(registration.status)} />
                          {registration.checkedInAt && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Checked In
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {registration.email} • {registration.eventName}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(registration.registrationDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />${registration.amount}
                          </span>
                          <span>{registration.attendeeType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <Badge
                          className={getPaymentBadge(registration.paymentStatus).color}
                          variant="outline"
                        >
                          {getPaymentBadge(registration.paymentStatus).label}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">ID: {registration.id}</div>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing 1-5 of {registrationsData.summary.total} registrations
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
