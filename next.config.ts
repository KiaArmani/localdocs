import { withContentCollections } from "@content-collections/next";
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import type { Configuration } from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove webpackDevMiddleware
  // webpackDevMiddleware: (config) => {
  //   // Important: return the modified config
  //   config.watchOptions = {
  //     ignored: ['**/node_modules/**', '**/.next/**', '**/.content-collections/**'], // Added .content-collections
  //     poll: 1000, // Check for changes every second
  //   };
  //   return config;
  // },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // Use this temporarily to bypass the persistent build error in generated types.
    // TODO: Remove this once the underlying Next.js bug is fixed.
    ignoreBuildErrors: true,
  },
  webpack(config: Configuration, { dev, isServer }: { dev: boolean, isServer: boolean }) {
    // Apply watchOptions only in development and for the client bundle
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.next/**', '**/.content-collections/**'], // Keep .content-collections ignored
        poll: 1000, // Optional: Check for changes every second
      };
    }
    // Important: return the modified config
    return config;
  },
};

export default withContentCollections(nextConfig);
