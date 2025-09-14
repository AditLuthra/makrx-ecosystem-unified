'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, FileText, AlertTriangle, Shield, Users, CreditCard } from 'lucide-react';

export default function TermsOfService() {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-makrx-blue to-blue-800 dark:from-gray-800 dark:to-makrx-blue/20 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <Scale className="w-16 h-16 text-makrx-yellow" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-xl text-white/90 mb-6">Legal terms and conditions for using MakrX</p>
          <p className="text-white/80">Last updated: {currentDate} | Effective: January 20, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Important Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                Important Legal Notice
              </h2>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                By accessing or using MakrX services, you agree to be bound by these Terms of
                Service. If you disagree with any part of these terms, you may not access the
                service.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introduction and Acceptance
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms of Service ("Terms") govern your use of the MakrX platform, including
              makrx.org, MakrCave, MakrX Store, and all related services (collectively, the
              "Services") operated by
              <strong> Botness Technologies Pvt Ltd</strong> ("Company," "we," "our," or "us").
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms constitute a legally binding agreement between you and Botness
              Technologies Pvt Ltd, a company incorporated under the laws of India with its
              registered office in Bangalore, Karnataka.
            </p>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Definitions
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <dl className="space-y-3">
                <div>
                  <dt className="font-semibold text-gray-800 dark:text-gray-200">"Platform"</dt>
                  <dd className="text-gray-600 dark:text-gray-400">
                    The MakrX ecosystem including all websites, applications, and services
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-800 dark:text-gray-200">
                    "User" or "You"
                  </dt>
                  <dd className="text-gray-600 dark:text-gray-400">
                    Any individual or entity accessing or using our Services
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-800 dark:text-gray-200">"Makerspace"</dt>
                  <dd className="text-gray-600 dark:text-gray-400">
                    Physical spaces with tools and equipment accessible through our platform
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-800 dark:text-gray-200">"Content"</dt>
                  <dd className="text-gray-600 dark:text-gray-400">
                    All information, data, text, software, music, sound, photographs, graphics,
                    video, messages, or other materials
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Account Registration */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-makrx-blue" />
              3. Account Registration and Eligibility
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              3.1 Eligibility
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-1">
              <li>You must be at least 18 years old to use our Services</li>
              <li>You must provide accurate, current, and complete information</li>
              <li>You must not be prohibited from using the Services under applicable law</li>
              <li>Corporate accounts require proper authorization to bind the entity</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              3.2 Account Security
            </h3>
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-300 text-sm">
                <strong>You are responsible for:</strong> Maintaining the confidentiality of your
                account credentials, all activities under your account, and immediately notifying us
                of any unauthorized use.
              </p>
            </div>
          </section>

          {/* Service Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Description of Services
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  MakrCave Platform
                </h3>
                <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                  <li>• Makerspace discovery and booking</li>
                  <li>• Equipment reservation system</li>
                  <li>• Project management tools</li>
                  <li>• Community features</li>
                </ul>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">MakrX Store</h3>
                <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                  <li>• E-commerce marketplace</li>
                  <li>• 3D printing services</li>
                  <li>• Custom manufacturing</li>
                  <li>• Tool and material sales</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-makrx-blue" />
              6. Payment Terms and Billing
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              6.1 Pricing and Fees
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-1">
              <li>All prices are in Indian Rupees (INR) unless otherwise specified</li>
              <li>Prices include applicable taxes (GST) as required by law</li>
              <li>Subscription fees are billed in advance on a recurring basis</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              6.2 Payment Processing
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-300 text-sm">
                Payments are processed by authorized payment gateways. We do not store your complete
                payment card details. All transactions are subject to verification and anti-fraud
                checks.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-makrx-blue" />
              7. Intellectual Property Rights
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              7.1 Our Rights
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The MakrX platform, including all content, features, and functionality, is owned by
              Botness Technologies Pvt Ltd and protected by copyright, trademark, and other
              intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              7.2 Your Content
            </h3>
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-300 text-sm">
                <strong>You retain ownership</strong> of content you upload. By using our Services,
                you grant us a license to use, store, and display your content solely for providing
                and improving our Services.
              </p>
            </div>
          </section>

          {/* Liability and Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-makrx-blue" />
              8. Disclaimers and Limitation of Liability
            </h2>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
                8.1 Service Availability
              </h3>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                Services are provided "as is" and "as available." We do not guarantee uninterrupted
                or error-free service. Scheduled maintenance and unexpected downtime may occur.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              8.2 Limitation of Liability
            </h3>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                <strong>To the maximum extent permitted by law,</strong> our liability is limited to
                the amount you paid for the specific service in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              13. Contact Information
            </h2>
            <div className="bg-makrx-blue/10 dark:bg-makrx-blue/20 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-makrx-blue mb-2">Legal Queries</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Email:{' '}
                    <a href="mailto:legal@makrx.org" className="text-makrx-blue underline">
                      legal@makrx.org
                    </a>
                    <br />
                    Phone: +91-80-4567-8900
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-makrx-blue mb-2">Registered Address</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Botness Technologies Pvt Ltd
                    <br />
                    Plot No. 123, Tech Park
                    <br />
                    Electronic City, Phase 2<br />
                    Bangalore, Karnataka 560100, India
                    <br />
                    CIN: U72900KA2024PTC123456
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-makrx-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to MakrX
          </Link>
        </div>
      </div>
    </div>
  );
}
