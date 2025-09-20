/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Enable transpilation of local packages
  transpilePackages: ['@makrx/auth', '@makrx/shared-ui', '@makrx/types'],

  // Environment variables
  env: {
    APP_VERSION: process.env.npm_package_version || '1.0.0',
    BUILD_TIME: new Date().toISOString(),
  },

  reactStrictMode: true,

  // API proxy for development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'production'
            ? 'https://services.makrx.store/api/:path*'
            : 'http://localhost:8001/api/:path*', // Proxy to FastAPI backend (dev on :8001) and preserve /api prefix
      },
    ];
  },

  // Security headers
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
          { key: 'X-Frame-Options', value: 'DENY' },
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

  // Compress responses
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,

  // Power off Next.js header
  poweredByHeader: false,

  // Webpack configuration for custom modules
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle Keycloak JS modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    };

    // Provide polyfills for Node.js modules in browser
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),
    );

    return config;
  },

  // TypeScript configuration
  typescript: {
    // Enforce type errors in CI builds
    ignoreBuildErrors: process.env.CI !== 'true',
  },

  // ESLint configuration
  eslint: {
    // Enforce lint errors in CI builds
    ignoreDuringBuilds: process.env.CI !== 'true',
  },

  // Images configuration for optimization
  images: {
    domains: ['localhost', 'makrx.org'],
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental features
  experimental: {
    // Enable modern builds
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;
