'use client';

import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { KeycloakProvider, useAuthHeaders } from '@makrx/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import React, { useState } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const authConfig = {
  keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'makrx',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'makrx-events',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // SSR/SSG or mock mode: return static fallback UI
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return (
      <html lang="en">
        <head>
          <title>MakrX.events - Global Maker Event Platform</title>
          <meta
            name="description"
            content="Discover and create maker events, workshops, competitions, and exhibitions worldwide"
          />
        </head>
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-3xl font-bold mb-4">MakrX.events (Static Export)</h1>
            <p className="text-lg text-gray-600 mb-8">
              This is a static fallback. Auth and dynamic data are disabled in static export.
            </p>
            {children}
          </div>
        </body>
      </html>
    );
  }

  const getAuthHeaders = useAuthHeaders();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            queryFn: async ({ queryKey }) => {
              const [url] = queryKey as string[];

              if (url.startsWith('/api/')) {
                const headers = await getAuthHeaders();
                const res = await fetch(url, {
                  credentials: 'include',
                  headers: headers,
                });

                if (!res.ok) {
                  const error = await res.text();
                  throw new Error(`${res.status}: ${error}`);
                }

                return res.json();
              }

              throw new Error(`Unsupported query: ${url}`);
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      }),
  );

  return (
    <html lang="en">
      <head>
        <title>MakrX.events - Global Maker Event Platform</title>
        <meta
          name="description"
          content="Discover and create maker events, workshops, competitions, and exhibitions worldwide"
        />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <KeycloakProvider config={authConfig}>
              <Toaster />
              {children}
            </KeycloakProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
