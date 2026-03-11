/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
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
