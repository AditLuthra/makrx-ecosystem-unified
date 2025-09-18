/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@makrx/auth', '@makrx/shared-ui', '@makrx/types'],
  reactStrictMode: true,
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const razorpayHosts = [
      'https://checkout.razorpay.com',
      'https://api.razorpay.com',
      'https://*.razorpay.com',
      'https://*.rzp.io',
    ];

    const prodCspDirectives = [
      "default-src 'self'",
      `script-src 'self' ${razorpayHosts.join(' ')}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      `connect-src 'self' https: ${razorpayHosts.join(' ')}`,
      `frame-src 'self' ${razorpayHosts.join(' ')}`,
      "frame-ancestors 'none'",
    ];

    const devCspDirectives = [
      "default-src 'self' http: https: data: blob",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' http: https:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: http: https:",
      "connect-src 'self' http: https: ws: wss:",
      "frame-src 'self' http: https:",
      "frame-ancestors 'none'",
    ];

    const csp = (isProd ? prodCspDirectives : devCspDirectives).join('; ');
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
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
