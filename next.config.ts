import { withContentCollections } from "@content-collections/next";
import type { Configuration } from 'webpack';
import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Only use export mode in production, not in development
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  typescript: {
    // Ignore TypeScript errors for React 19 compatibility
    ignoreBuildErrors: true,
  },
  // Experimental flag for React 19 compatibility
  experimental: {
    // Add any experimental flags for React 19 compatibility
    serverActions: {
      bodySizeLimit: '2mb'
    },
  },
  webpack(config: Configuration, { dev, isServer }: { dev: boolean, isServer: boolean }) {
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.next/**', '**/.content-collections/**'],
        poll: 3000,
      };
    }
    return config;
  },
};

export default withContentCollections(nextConfig);
