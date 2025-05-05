import { withContentCollections } from "@content-collections/next";

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
  webpack(config, { dev, isServer }) {
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
