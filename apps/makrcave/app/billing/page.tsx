'use client';

import {
  Calendar,
  CheckCircle,
  CreditCard,
  Crown,
  FileText,
  Plus,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Import new billing components
import AddCreditsButton from '../../components/billing/AddCreditsButton';
import BillingOverview from '../../components/billing/BillingOverview';
import CreditBalanceDisplay from '../../components/billing/CreditBalanceDisplay';
import InventoryReorderModal from '../../components/billing/InventoryReorderModal';
import InvoiceCard from '../../components/billing/InvoiceCard';
import MembershipCard from '../../components/billing/MembershipCard';
import PaymentForm from '../../components/billing/PaymentForm';
import PricingConfigForm from '../../components/billing/PricingConfigForm';
import ReorderHistoryTable from '../../components/billing/ReorderHistoryTable';
import RevenueGraph from '../../components/billing/RevenueGraph';
import SubscriptionStatus from '../../components/billing/SubscriptionStatus';
import TransactionHistoryList from '../../components/billing/TransactionHistoryList';
import UpgradePlanModal from '../../components/billing/UpgradePlanModal';
import UsageByCategoryPieChart from '../../components/billing/UsageByCategoryPieChart';

import { useAuthHeaders } from '@makrx/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

const Billing: React.FC = () => {
  const { user, hasPermission, isSuperAdmin, isMakerspaceAdmin } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false);
  const [showInventoryReorderModal, setShowInventoryReorderModal] = useState(false);
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const getHeaders = useAuthHeaders();

  // Mock data - in real app this would come from API
  type Subscription = {
    plan: string;
    status: 'active' | 'expired' | 'cancelled';
    nextBilling: string;
    amount: number;
    currency: string;
    features: string[];
  };
  type Transaction = {
    id: string;
    type: 'subscription' | 'credits' | 'reorder' | 'service';
    description: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    date: string;
    invoiceId?: string;
  };
  type Invoice = {
    id: string;
    date: string;
    amount: number;
    status: 'pending' | 'overdue' | 'cancelled' | 'paid';
    description: string;
    downloadUrl: string;
  };

  const [billingData, setBillingData] = useState<{
    subscription: Subscription;
    credits: { balance: number; totalSpent: number; totalPurchased: number };
    recentTransactions: Transaction[];
    invoices: Invoice[];
    analytics: {
      monthlyRevenue: number;
      totalUsers: number;
      creditUsage: number;
      refundRate: number;
    };
  }>({
    subscription: {
      plan: '',
      status: 'active',
      nextBilling: '',
      amount: 0,
      currency: 'USD',
      features: [],
    },
    credits: { balance: 0, totalSpent: 0, totalPurchased: 0 },
    recentTransactions: [],
    invoices: [],
    analytics: {
      monthlyRevenue: 0,
      totalUsers: 0,
      creditUsage: 0,
      refundRate: 0,
    },
  });
  const [revenueSeries, setRevenueSeries] = useState<Array<{ month: string; revenue: number }>>([]);
  const [usageSeries, setUsageSeries] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);

  const loadBillingData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getHeaders({ 'Content-Type': 'application/json' });
      const [subRes, creditsRes, txRes, invRes, analyticsRes, revRes, usageRes] = await Promise.all(
        [
          fetch('/api/v1/billing/subscription', { headers }),
          fetch('/api/v1/billing/credits', { headers }),
          fetch('/api/v1/billing/transactions?limit=20', { headers }),
          fetch('/api/v1/billing/invoices', { headers }),
          fetch('/api/v1/billing/analytics', { headers }),
          fetch('/api/v1/billing/revenue-series', { headers }),
          fetch('/api/v1/billing/usage-by-category', { headers }),
        ],
      );

      const sub = subRes.ok ? await subRes.json() : null;
      const credits = creditsRes.ok ? await creditsRes.json() : null;
      const txs = txRes.ok ? await txRes.json() : [];
      const invs = invRes.ok ? await invRes.json() : [];
      const analytics = analyticsRes.ok ? await analyticsRes.json() : null;
      const rev = revRes.ok ? await revRes.json() : [];
      const usage = usageRes.ok ? await usageRes.json() : [];

      setBillingData((prev) => ({
        ...prev,
        subscription: sub
          ? {
              plan: sub.plan || '',
              status: (sub.status as Subscription['status']) || 'active',
              nextBilling: sub.nextBilling || '',
              amount: Number(sub.amount || 0),
              currency: sub.currency || 'USD',
              features: sub.features || [],
            }
          : prev.subscription,
        credits: credits
          ? {
              balance: Number(credits.balance || 0),
              totalSpent: Number(credits.totalSpent || 0),
              totalPurchased: Number(credits.totalPurchased || 0),
            }
          : prev.credits,
        recentTransactions: Array.isArray(txs) ? txs : [],
        invoices: Array.isArray(invs) ? invs : [],
        analytics: analytics
          ? {
              monthlyRevenue: Number(analytics.monthlyRevenue || 0),
              totalUsers: Number(analytics.totalUsers || 0),
              creditUsage: Number(analytics.creditUsage || 0),
              refundRate: Number(analytics.refundRate || 0),
            }
          : prev.analytics,
      }));
      setRevenueSeries(Array.isArray(rev) ? rev : []);
      setUsageSeries(
        Array.isArray(usage)
          ? usage.map((item: any) => ({
              ...item,
              color: item.color ?? '#8884d8',
            }))
          : [],
      );
    } catch (error: any) {
      toast({
        title: 'Error loading billing data',
        description: error?.message || 'Unknown error',
        variant: 'destructive',
      });
      setRevenueSeries([]);
      setUsageSeries([]);
    } finally {
      setLoading(false);
    }
  }, [toast, getHeaders]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const handleUpgradePlan = (planData: any) => {
    console.log('Upgrading to plan:', planData);
    toast({
      title: 'Plan upgrade initiated',
      description: 'You will be redirected to payment processing',
    });
    setShowUpgradePlanModal(false);
  };

  const handleAddCredits = (amount: number) => {
    console.log('Adding credits:', amount);
    toast({
      title: 'Credits purchase initiated',
      description: `Processing purchase of ${amount} credits`,
    });
    setShowAddCreditsModal(false);
  };

  const handleReorder = (orderData: any) => {
    console.log('Creating reorder:', orderData);
    toast({
      title: 'Reorder submitted',
      description: 'Your inventory reorder has been submitted for approval',
    });
    setShowInventoryReorderModal(false);
  };

  // Determine user access level
  const canViewGlobalAnalytics = isSuperAdmin;
  const canManagePricing = isSuperAdmin;
  const canViewMakerspaceAnalytics = isSuperAdmin || isMakerspaceAdmin;
  const canReorderInventory = isSuperAdmin || isMakerspaceAdmin;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading billing data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Billing & Payments
          </h1>
          <p className="text-gray-600">
            {isSuperAdmin
              ? 'Manage billing across all makerspaces and users'
              : isMakerspaceAdmin
                ? 'Manage billing for your makerspace and approve purchases'
                : 'Manage your subscriptions, payments, and credits'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canReorderInventory && (
            <Button variant="outline" onClick={() => setShowInventoryReorderModal(true)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Reorder Inventory
            </Button>
          )}
          <AddCreditsButton onAddCredits={() => setShowAddCreditsModal(true)} />
        </div>
      </div>

      {/* Quick Stats Overview */}
      {!isSuperAdmin && !isMakerspaceAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subscription Status */}
          <SubscriptionStatus
            subscription={billingData.subscription}
            onUpgrade={() => setShowUpgradePlanModal(true)}
          />

          {/* Credit Balance */}
          <CreditBalanceDisplay
            balance={billingData.credits.balance}
            totalSpent={billingData.credits.totalSpent}
            onAddCredits={() => setShowAddCreditsModal(true)}
          />

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">₹12,367</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    On track
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Analytics Overview */}
      {(isSuperAdmin || isMakerspaceAdmin) && (
        <BillingOverview analytics={billingData.analytics} userRole={user?.role || 'user'} />
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${getTabGridCols()}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {!isSuperAdmin && !isMakerspaceAdmin && (
            <TabsTrigger value="membership">Membership</TabsTrigger>
          )}
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          {canReorderInventory && <TabsTrigger value="reorders">Reorders</TabsTrigger>}
          {canViewGlobalAnalytics && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          {canManagePricing && <TabsTrigger value="pricing">Pricing</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {!isSuperAdmin && !isMakerspaceAdmin ? (
            // User Overview
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MembershipCard
                subscription={billingData.subscription}
                onUpgrade={() => setShowUpgradePlanModal(true)}
              />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billingData.recentTransactions.slice(0, 3).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-600">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${transaction.amount}</p>
                          <Badge
                            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Admin Overview
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueGraph data={revenueSeries} />
              <UsageByCategoryPieChart
                data={usageSeries.map((item) => ({
                  ...item,
                  color: (item.color ?? '#8884d8') as string,
                }))}
              />
            </div>
          )}
        </TabsContent>

        {/* Membership Tab (Users only) */}
        {!isSuperAdmin && !isMakerspaceAdmin && (
          <TabsContent value="membership" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MembershipCard
                  subscription={billingData.subscription}
                  onUpgrade={() => setShowUpgradePlanModal(true)}
                  detailed={true}
                />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plan Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {billingData.subscription.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4" onClick={() => setShowUpgradePlanModal(true)}>
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <TransactionHistoryList transactions={billingData.recentTransactions} />
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {billingData.invoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        </TabsContent>

        {/* Reorders Tab (Admins only) */}
        {canReorderInventory && (
          <TabsContent value="reorders" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Inventory Reorders</h3>
              <Button onClick={() => setShowInventoryReorderModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Reorder
              </Button>
            </div>
            <ReorderHistoryTable />
          </TabsContent>
        )}

        {/* Analytics Tab (Super Admin only) */}
        {canViewGlobalAnalytics && (
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueGraph data={revenueSeries} />
              <UsageByCategoryPieChart
                data={usageSeries.map((item) => ({
                  ...item,
                  color: (item.color ?? '#8884d8') as string,
                }))}
              />
            </div>
            <BillingOverview
              analytics={billingData.analytics}
              userRole={user?.role || 'user'}
              detailed={true}
            />
          </TabsContent>
        )}

        {/* Pricing Tab (Super Admin only) */}
        {canManagePricing && (
          <TabsContent value="pricing" className="space-y-6">
            <PricingConfigForm />
          </TabsContent>
        )}
      </Tabs>

      {/* Modals */}
      {showUpgradePlanModal && (
        <UpgradePlanModal
          isOpen={showUpgradePlanModal}
          onClose={() => setShowUpgradePlanModal(false)}
          currentPlan={billingData.subscription.plan}
          onUpgrade={handleUpgradePlan}
        />
      )}

      {showInventoryReorderModal && (
        <InventoryReorderModal
          isOpen={showInventoryReorderModal}
          onClose={() => setShowInventoryReorderModal(false)}
          onSubmit={handleReorder}
        />
      )}

      {showAddCreditsModal && (
        <PaymentForm
          isOpen={showAddCreditsModal}
          onClose={() => setShowAddCreditsModal(false)}
          type="credits"
          onSubmit={handleAddCredits}
        />
      )}
    </div>
  );

  function getTabGridCols() {
    let cols = 4; // Overview, Transactions, Invoices
    if (!isSuperAdmin && !isMakerspaceAdmin) cols += 1; // Membership
    if (canReorderInventory) cols += 1; // Reorders
    if (canViewGlobalAnalytics) cols += 1; // Analytics
    if (canManagePricing) cols += 1; // Pricing
    return `grid-cols-${Math.min(cols, 7)}`;
  }

  // no mock helpers
};

export default Billing;
