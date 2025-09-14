import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@makrx/auth', '@makrx/shared-ui', '@makrx/types'],
  experimental: {
    esmExternals: false,
  },
  eslint: {
    // Re-enable linting during build to catch issues
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Re-enable type checking during build
    ignoreBuildErrors: false,
  },
  webpack: (config, { webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      process: require.resolve('process/browser'),
    };

    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),
    );

    return config;
  },
};

export default nextConfig;
