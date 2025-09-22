"use client";

import React from "react";

import { ThemeProvider } from "next-themes";
import { KeycloakProvider } from "@makrx/auth";
import { ServiceOrderProvider } from "@/contexts/ServiceOrderContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { FeatureFlagsProvider } from "@/lib/features/context";

const authConfig = {
  keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8081",
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8081",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "makrx",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "makrx-services",
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FeatureFlagsProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <KeycloakProvider config={authConfig}>
          <NotificationProvider>
            <ServiceOrderProvider>{children}</ServiceOrderProvider>
          </NotificationProvider>
        </KeycloakProvider>
      </ThemeProvider>
    </FeatureFlagsProvider>
  );
}
