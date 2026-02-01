/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  images: {
    domains: ['www.bcra.gob.ar'],
  },
  async redirects() {
    return [
      { source: '/ganancias', destination: '/calculadora-sueldo-neto', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
