/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@makrx/auth', '@makrx/shared', '@makrx/shared-ui', '@makrx/types'],
  typescript: {
    ignoreBuildErrors: process.env.CI !== 'true',
  },
  eslint: {
    ignoreDuringBuilds: process.env.CI !== 'true',
  },
  async rewrites() {
    const servicesApi = process.env.NEXT_PUBLIC_SERVICES_API_URL || 'http://localhost:8006/api';
    const storeApi = process.env.NEXT_PUBLIC_STORE_API_URL || 'http://localhost:8004/api';
    return [
      // API proxy to services backend
      {
        source: '/api/:path*',
        destination: `${servicesApi}/:path*`,
      },
      // Cross-platform order sync
      {
        source: '/api/orders/sync/:path*',
        destination: `${storeApi}/orders/:path*`,
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_SERVICES_API_URL: process.env.NEXT_PUBLIC_SERVICES_API_URL || 'http://localhost:8006/api',
    NEXT_PUBLIC_STORE_API_URL: process.env.NEXT_PUBLIC_STORE_API_URL || 'http://localhost:8004/api',
    NEXT_PUBLIC_SERVICES_URL: process.env.NEXT_PUBLIC_SERVICES_URL || 'http://localhost:3005',
    NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;
