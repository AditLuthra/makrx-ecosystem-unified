import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Ticket,
  Plus,
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  Copy,
  Users,
  DollarSign,
  Calendar,
  Percent,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface TicketsPageProps {
  params: {
    micrositeSlug: string;
  };
}

// Mock tickets data - replace with real API calls
async function getTicketsData(slug: string) {
  const mockData = {
    makerfest2024: {
      id: '1',
      slug: 'makerfest2024',
      title: 'MakerFest 2024',
      tickets: [
        {
          id: 'tkt_001',
          name: 'General Admission',
          description: 'Access to all workshops and exhibitions',
          type: 'paid',
          price: 45,
          currency: 'USD',
          quantity: 500,
          sold: 234,
          available: 266,
          status: 'active',
          earlyBird: false,
          saleStartDate: '2024-01-15T00:00:00Z',
          saleEndDate: '2024-03-14T23:59:59Z',
          benefits: [
            'Access to all workshop sessions',
            'Exhibition hall access',
            'Networking lunch included',
            'Digital certificate',
          ],
        },
        {
          id: 'tkt_002',
          name: 'Student Discount',
          description: 'Discounted ticket for students with valid ID',
          type: 'paid',
          price: 25,
          currency: 'USD',
          quantity: 100,
          sold: 89,
          available: 11,
          status: 'active',
          earlyBird: false,
          saleStartDate: '2024-01-15T00:00:00Z',
          saleEndDate: '2024-03-14T23:59:59Z',
          benefits: [
            'Access to all workshop sessions',
            'Exhibition hall access',
            'Student networking session',
          ],
        },
        {
          id: 'tkt_003',
          name: 'VIP Access',
          description: 'Premium experience with exclusive perks',
          type: 'paid',
          price: 150,
          currency: 'USD',
          quantity: 50,
          sold: 23,
          available: 27,
          status: 'active',
          earlyBird: false,
          saleStartDate: '2024-01-15T00:00:00Z',
          saleEndDate: '2024-03-14T23:59:59Z',
          benefits: [
            'All General Admission benefits',
            'Priority seating in workshops',
            'Exclusive VIP lounge access',
            'Meet & greet with speakers',
            'Premium swag bag',
          ],
        },
        {
          id: 'tkt_004',
          name: 'Free Community Pass',
          description: 'Limited free tickets for community members',
          type: 'free',
          price: 0,
          currency: 'USD',
          quantity: 50,
          sold: 50,
          available: 0,
          status: 'sold_out',
          earlyBird: false,
          saleStartDate: '2024-01-15T00:00:00Z',
          saleEndDate: '2024-03-14T23:59:59Z',
          benefits: ['Exhibition hall access', 'Basic networking opportunities'],
        },
        {
          id: 'tkt_005',
          name: 'Early Bird Special',
          description: 'Limited time early bird pricing',
          type: 'paid',
          price: 35,
          currency: 'USD',
          quantity: 100,
          sold: 100,
          available: 0,
          status: 'ended',
          earlyBird: true,
          saleStartDate: '2024-01-01T00:00:00Z',
          saleEndDate: '2024-01-31T23:59:59Z',
          benefits: [
            'All General Admission benefits',
            'Early bird pricing',
            'Priority registration',
          ],
        },
      ],
      coupons: [
        {
          id: 'cpn_001',
          code: 'MAKER2024',
          description: 'Launch week discount',
          type: 'percentage',
          value: 20,
          usageLimit: 100,
          used: 45,
          status: 'active',
          expiryDate: '2024-02-15T23:59:59Z',
        },
        {
          id: 'cpn_002',
          code: 'STUDENT15',
          description: 'Student additional discount',
          type: 'fixed',
          value: 15,
          usageLimit: 50,
          used: 23,
          status: 'active',
          expiryDate: '2024-03-14T23:59:59Z',
        },
      ],
    },
  };

  return mockData[slug as keyof typeof mockData] || null;
}

const getStatusBadge = (status: string) => {
  const variants = {
    active: { variant: 'default' as const, label: 'Active', color: 'bg-green-100 text-green-800' },
    sold_out: {
      variant: 'secondary' as const,
      label: 'Sold Out',
      color: 'bg-red-100 text-red-800',
    },
    ended: { variant: 'outline' as const, label: 'Ended', color: 'bg-gray-100 text-gray-800' },
    paused: {
      variant: 'outline' as const,
      label: 'Paused',
      color: 'bg-yellow-100 text-yellow-800',
    },
  };

  return (
    variants[status as keyof typeof variants] || {
      variant: 'outline' as const,
      label: status,
      color: 'bg-gray-100 text-gray-800',
    }
  );
};

export default async function TicketsPage({ params }: TicketsPageProps) {
  const { micrositeSlug } = await params;
  const ticketsData = await getTicketsData(micrositeSlug);

  if (!ticketsData) {
    notFound();
  }

  const totalRevenue = ticketsData.tickets.reduce(
    (sum, ticket) => sum + ticket.price * ticket.sold,
    0,
  );
  const totalSold = ticketsData.tickets.reduce((sum, ticket) => sum + ticket.sold, 0);
  const totalAvailable = ticketsData.tickets.reduce((sum, ticket) => sum + ticket.available, 0);

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
              <h1 className="text-2xl font-bold text-gray-900">{ticketsData.title} - Ticketing</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Ticket Type</DialogTitle>
                    <DialogDescription>
                      Set up pricing, quantity, and benefits for a new ticket tier.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Ticket Name</label>
                      <Input placeholder="e.g., General Admission" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input placeholder="Brief description of what's included" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Price</label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Quantity Available</label>
                        <Input type="number" placeholder="100" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Sale Start Date</label>
                        <Input type="datetime-local" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Sale End Date</label>
                        <Input type="datetime-local" />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline">Save as Draft</Button>
                      <Button>Create Ticket</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Tickets Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalSold}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalAvailable}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Ticket Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{ticketsData.tickets.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ticket className="h-5 w-5 mr-2" />
              Ticket Types
            </CardTitle>
            <CardDescription>Manage ticket pricing, quantities, and availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketsData.tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold">{ticket.name}</h4>
                        <Badge variant="outline" className={getStatusBadge(ticket.status).color}>
                          {getStatusBadge(ticket.status).label}
                        </Badge>
                        {ticket.earlyBird && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-800">
                            Early Bird
                          </Badge>
                        )}
                        {ticket.type === 'free' && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Free
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3">{ticket.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div className="flex items-center text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {ticket.price > 0 ? `$${ticket.price}` : 'Free'}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {ticket.sold}/{ticket.quantity} sold
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Sales end: {new Date(ticket.saleEndDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500">
                          Revenue: ${(ticket.price * ticket.sold).toLocaleString()}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(ticket.sold / ticket.quantity) * 100}%` }}
                        ></div>
                      </div>

                      {/* Benefits */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Includes:</p>
                        <div className="flex flex-wrap gap-1">
                          {ticket.benefits.slice(0, 3).map((benefit, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {benefit}
                            </span>
                          ))}
                          {ticket.benefits.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{ticket.benefits.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coupons Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Percent className="h-5 w-5 mr-2" />
              Discount Coupons
            </CardTitle>
            <CardDescription>Manage promotional codes and discounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input placeholder="Search coupons..." className="pl-10 w-64" />
                </div>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Coupon
              </Button>
            </div>

            <div className="space-y-3">
              {ticketsData.coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {coupon.code}
                      </code>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {coupon.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        {coupon.type === 'percentage'
                          ? `${coupon.value}% off`
                          : `$${coupon.value} off`}
                      </span>
                      <span>
                        Used: {coupon.used}/{coupon.usageLimit}
                      </span>
                      <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
