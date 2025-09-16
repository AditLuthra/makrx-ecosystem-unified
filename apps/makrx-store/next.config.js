const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const experimentalDemosPath = path.join('..', 'experimental', 'makrx-store-demos', '**');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@makrx/auth', '@makrx/shared-ui', '@makrx/types'],
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const csp = isProd
      ? "default-src 'self'; script-src 'self' https:; style-src 'self'; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'"
      : "default-src 'self' http: https: data: blob; script-src 'self' 'unsafe-eval' 'unsafe-inline' http: https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: http: https:; connect-src 'self' http: https: ws: wss:; frame-ancestors 'none'";
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: process.env.CI !== 'true',
  },
  eslint: {
    ignoreDuringBuilds: process.env.CI !== 'true',
  },
  reactStrictMode: true,
  swcMinify: true,
  // Suppress hydration warnings caused by browser extensions
  compiler: {
    removeConsole: isProduction
      ? {
          exclude: ['error'],
        }
      : false,
  },
  // Add development server configuration to fix RSC payload issues
  devIndicators: {
    buildActivity: false,
  },
  // Improve development experience
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Fast refresh is handled automatically by Next.js
  // Reduce development noise
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
  images: {
    domains: ['localhost', 'makrx.store', 'images.unsplash.com'],
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: 'makrx-store',
  },
  experimental: {
    externalDir: true,
    ...(isProduction
      ? {
          outputFileTracingExcludes: {
            '*': [experimentalDemosPath],
          },
        }
      : {}),
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@makrx/ui': path.resolve(__dirname, '../packages/ui'),
      '@makrx/types': path.resolve(__dirname, '../packages/types'),
    };
    return config;
  },
};

module.exports = nextConfig;
