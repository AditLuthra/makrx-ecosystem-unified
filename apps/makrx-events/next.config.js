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
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'replit.com',
      },
    ],
  },
};

module.exports = nextConfig;
