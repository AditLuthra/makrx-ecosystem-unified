'use client';

import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { KeycloakProvider } from '@makrx/auth';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const authConfig = {
  keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'makrx',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'makrx-events',
};


const authConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'makrx',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'makrx-events',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: async ({ queryKey }) => {
          const [url] = queryKey as string[];
          
          if (url.startsWith("/api/")) {
            const res = await fetch(url, {
              credentials: "include",
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
  }));

  return (
    <html lang="en">
      <head>
        <title>MakrX.events - Global Maker Event Platform</title>
        <meta name="description" content="Discover and create maker events, workshops, competitions, and exhibitions worldwide" />
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