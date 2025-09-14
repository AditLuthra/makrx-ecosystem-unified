'use client';

import { useState } from 'react';
import { Building2, UserPlus, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise'>('basic');

  const plans = [
    {
      id: 'basic' as const,
      name: 'Basic',
      price: 'Free',
      description: 'Perfect for individuals and small teams',
      features: [
        '5 equipment reservations/month',
        'Basic inventory tracking',
        'Project collaboration',
        'Community access',
      ],
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: '$29/month',
      description: 'For growing makerspaces',
      features: [
        'Unlimited reservations',
        'Advanced analytics',
        'Custom workflows',
        'Priority support',
        'API access',
      ],
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'Custom training',
      ],
    },
  ];

  const handleRegister = () => {
    // In a real app, this would handle the registration process
    // For now, redirect to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Join MakrCave</h1>
          <p className="text-xl text-gray-300">Start managing your makerspace today</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-slate-800/50 backdrop-blur-sm border transition-all duration-200 cursor-pointer hover:scale-105 ${
                selectedPlan === plan.id
                  ? 'border-blue-400 shadow-lg shadow-blue-500/20'
                  : 'border-blue-500/30 hover:border-blue-400/50'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.id === 'pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-300">{plan.description}</CardDescription>
                <div className="text-3xl font-bold text-blue-400">{plan.price}</div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registration Form */}
        <div className="max-w-md mx-auto">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create Your Account
              </CardTitle>
              <CardDescription className="text-gray-300">
                Get started with {plans.find((p) => p.id === selectedPlan)?.name} plan
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Makerspace Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your makerspace name"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Create a secure password"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 transition-all"
                />
              </div>

              <Button
                onClick={handleRegister}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="text-center pt-4">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Why Choose MakrCave?</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Equipment Management</h4>
              <p className="text-gray-300 text-sm">
                Track, reserve, and maintain all your makerspace equipment with ease.
              </p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Project Collaboration</h4>
              <p className="text-gray-300 text-sm">
                Enable seamless collaboration between makers and project teams.
              </p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Member Management</h4>
              <p className="text-gray-300 text-sm">
                Manage memberships, permissions, and community engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
