'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { KeycloakProvider } from '@makrx/auth';
import { NotificationProvider } from '../contexts/NotificationContext';
import { SkillProvider } from '../contexts/SkillContext';
import { FeatureFlagProvider } from '../contexts/FeatureFlagContext';
import { AuthProvider } from '../contexts/AuthContext';
import { MakerspaceProvider } from '../contexts/MakerspaceContext';

const authConfig = {
  keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'makrx',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'makrcave',
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <KeycloakProvider config={authConfig}>
        <AuthProvider>
          <MakerspaceProvider>
            <FeatureFlagProvider>
              <SkillProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </SkillProvider>
            </FeatureFlagProvider>
          </MakerspaceProvider>
        </AuthProvider>
      </KeycloakProvider>
    </ThemeProvider>
  );
}
