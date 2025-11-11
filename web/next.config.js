/** @type {import('next').NextConfig} */
const nextConfig = {
  // This 'rewrites' rule is for local development.
  // It proxies any request to /api/* to your Python server.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;