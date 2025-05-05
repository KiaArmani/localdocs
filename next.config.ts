import { withContentCollections } from "@content-collections/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpackDevMiddleware: (config) => {
    // Important: return the modified config
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/.next/**', '**/.content-collections/**'], // Added .content-collections
      poll: 1000, // Check for changes every second
    };
    return config;
  },
};

export default withContentCollections(nextConfig);
