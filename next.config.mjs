/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:8081';

const nextConfig = {
  output: 'standalone',
  reactCompiler: true,
  allowedDevOrigins: ['100.110.147.82', '172.27.160.1'],
  experimental: {
    proxyTimeout: 600_000,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
