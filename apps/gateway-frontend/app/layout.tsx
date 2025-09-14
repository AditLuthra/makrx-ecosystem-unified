import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../lib/theme-clean';
import { KeycloakProvider } from '@makrx/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import IdleTimeoutBanner from '../components/IdleTimeoutBanner';
import HydrationWarningSupressor from '../components/HydrationWarningSupressor';
import PerformanceMonitor from '../components/PerformanceMonitor';
import { Toaster } from '../components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: {
        default: 'MakrX - Digital Manufacturing Ecosystem',
        template: '%s | MakrX',
    },
    description:
        "India's leading digital manufacturing platform connecting creators, makerspaces, and service providers. Access MakrCave makerspaces, shop at MakrX.Store, and get custom fabrication through 3D.MakrX.Store.",
    keywords: [
        'makerspace',
        'digital manufacturing',
        '3d printing',
        'laser cutting',
        'custom fabrication',
        'tools',
        'india',
        'makrx',
    ],
    authors: [{ name: 'MakrX Team' }],
    creator: 'MakrX',
    publisher: 'MakrX',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://makrx.org'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://makrx.org',
        title: 'MakrX - Digital Manufacturing Ecosystem',
        description:
            "India's leading digital manufacturing platform connecting creators, makerspaces, and service providers.",
        siteName: 'MakrX',
        images: [
            {
                url: 'https://makrx.org/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'MakrX - Digital Manufacturing Ecosystem',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@makrx',
        creator: '@makrx',
        title: 'MakrX - Digital Manufacturing Ecosystem',
        description:
            "India's leading digital manufacturing platform connecting creators, makerspaces, and service providers.",
        images: ['https://makrx.org/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    verification: {
        google: 'your-google-verification-code',
    },
};

const authConfig = {
    keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'makrx',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'gateway-frontend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('makrx-theme') || 'system';
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

                  document.documentElement.classList.add(resolvedTheme);
                  document.documentElement.setAttribute('data-theme', resolvedTheme);
                  document.documentElement.style.colorScheme = resolvedTheme;

                  // Suppress common browser extension attributes that cause hydration warnings
                  if (typeof window !== 'undefined') {
                    const suppressedAttrs = ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed'];
                    suppressedAttrs.forEach(attr => {
                      if (document.body && document.body.hasAttribute(attr)) {
                        document.body.removeAttribute(attr);
                      }
                    });
                  }
                } catch (e) {
                  console.warn('Theme initialization failed:', e);
                }
              })();
            `,
                    }}
                />
            </head>
            <body className={inter.className} suppressHydrationWarning={true}>
                <HydrationWarningSupressor />
                <PerformanceMonitor />
                <ThemeProvider>
                    <KeycloakProvider config={authConfig}>
                        <IdleTimeoutBanner />
                        <div className="min-h-screen flex flex-col">
                            {/* Skip Link for Accessibility */}
                            <a
                                href="#main-content"
                                className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-makrx-yellow focus:text-makrx-blue focus:rounded-md focus:font-semibold"
                            >
                                Skip to main content
                            </a>
                            <Header />

                            <main id="main-content" className="flex-1 pt-16 md:pt-20" role="main">
                                {children}
                            </main>

                            <Footer />
                        </div>
                        <Toaster />
                    </KeycloakProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
