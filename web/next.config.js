/** @type {import('next').NextConfig} */

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig = {
  // This is the production-safe setting for Vercel
  output: 'standalone',

  // --- THE FIX ---
  // Only add the 'rewrites' block if we are in local development
  ...(isDevelopment && {
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:8000/api/:path*",
        },
      ];
    },
  }),
};

module.exports = nextConfig;