'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function LoginPageContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 px-4">
        <div className="text-center">
          <Button variant="ghost" size="sm" asChild className="mb-8">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to MakrX.events</h2>
          <p className="text-gray-600">Sign in to create and manage maker events</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </CardTitle>
            <CardDescription>Access your account to create and manage events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Login button removed in static export mode */}

            <div className="text-center text-sm text-gray-500">
              <p>Don't have an account? Contact your administrator to get access.</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">New to MakrX.events?</h3>
            <p className="text-blue-700 text-sm mb-3">
              Join the global maker community! Create workshops, competitions, and exhibitions.
            </p>
            <Link href="/events" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Browse public events →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  // SSR/SSG or mock mode: return static fallback UI
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 px-4">
          <div className="text-center">
            <Button variant="ghost" size="sm" asChild className="mb-8">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Sign in to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login (Auth disabled in static export)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return <LoginPageContent />;
}
