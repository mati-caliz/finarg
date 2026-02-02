/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  images: {
    domains: ["www.bcra.gob.ar"],
  },
  compiler: {
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },
  async redirects() {
    return [
      { source: "/ganancias", destination: "/calculadora-sueldo-neto", permanent: true },
      { source: "/simulador", destination: "/simulador-de-inversiones", permanent: true },
      { source: "/reservas", destination: "/reservas-bcra", permanent: true },
      { source: "/tasas", destination: "/comparador-tasas", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://localhost:8080/api/v1/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
