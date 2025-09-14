'use client';

import { useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';

export default function Register() {
  useEffect(() => {
    // Redirect to main register page after a short delay
    const timer = setTimeout(() => {
      window.location.href = '/register';
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center text-white space-y-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Redirecting to Registration...</h1>
        <p className="text-gray-300">You will be redirected to the MakrCave registration page.</p>

        <div className="flex justify-center mb-6">
          <div className="w-8 h-8 border-4 border-gray-300/30 border-t-blue-400 rounded-full animate-spin" />
        </div>

        <Button
          onClick={handleManualRedirect}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
        >
          Continue to Registration
        </Button>

        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
