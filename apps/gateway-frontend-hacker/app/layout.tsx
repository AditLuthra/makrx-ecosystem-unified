"use client";
import { Inter } from 'next/font/google';
import { KeycloakProvider } from '@makrx/auth';
import { EnhancedNavigation } from '@/components/EnhancedNavigation';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const authConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081',
  keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'makrx',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'gateway-frontend-hacker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <KeycloakProvider config={authConfig}>
          <EnhancedNavigation />
          {children}
          <EnhancedFooter />
        </KeycloakProvider>
      </body>
    </html>
  );
}
