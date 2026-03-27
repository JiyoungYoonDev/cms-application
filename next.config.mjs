/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactCompiler: true,
  allowedDevOrigins: ['100.110.147.82'],
  async rewrites() {
    return [
      {
        source: '/api/problems',
        destination: 'http://localhost:8081/api/problems',
      },
    ];
  },
};

export default nextConfig;
