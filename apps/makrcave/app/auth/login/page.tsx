// ========================================
// LOGIN PAGE COMPONENT - SSO REDIRECT
// ========================================
// Redirects users to centralized auth.makrx.org SSO

'use client';

import { useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';

export default function Login() {
  useEffect(() => {
    // Redirect to main login page after a short delay
    const timer = setTimeout(() => {
      window.location.href = '/login';
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        {/* <ThemeToggle /> */}
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-600 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              MakrCave Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Makerspace Management System
            </p>
          </div>

          {/* Loading State */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Redirecting to secure login...
            </p>
            
            <button
              onClick={handleManualLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue to Login
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              🔒 Secure authentication powered by MakrX SSO
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 MakrX. All rights reserved.</p>
          <p className="mt-1">
            Need help? <a href="/contact" className="text-blue-600 hover:text-blue-700">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
