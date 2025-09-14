import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { KeycloakProvider } from "@makrx/auth";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/SharedThemeProvider";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToastNotifications from "@/components/ToastNotifications";
import IdleTimeoutBanner from "@/components/IdleTimeoutBanner";
import { HydrationFix } from "@/components/HydrationFix";
import DevErrorHandler from "@/components/DevErrorHandler";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

const authConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081',
  keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'makrx',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'makrx-store',
};

export const metadata: Metadata = {
  title: "MakrX Store - 3D Printing Materials & Services",
  description:
    "Premium 3D printing materials, equipment, and professional printing services for makers and professionals.",
  keywords:
    "3D printing, filament, PLA, ABS, PETG, 3D printer, maker, prototyping",
  authors: [{ name: "MakrX" }],
  openGraph: {
    title: "MakrX Store - 3D Printing Materials & Services",
    description:
      "Premium 3D printing materials, equipment, and professional printing services",
    url: "https://makrx.store",
    siteName: "MakrX Store",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MakrX Store - 3D Printing Materials & Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MakrX Store - 3D Printing Materials & Services",
    description:
      "Premium 3D printing materials, equipment, and professional printing services",
    images: ["/og-image.jpg"],
  },
  robots: "index, follow",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <KeycloakProvider config={authConfig}>
            <ThemeProvider>
              <NotificationProvider>
                <HydrationFix />
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
                <ToastNotifications />
                <IdleTimeoutBanner />
                <DevErrorHandler />
              </NotificationProvider>
            </ThemeProvider>
          </KeycloakProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
