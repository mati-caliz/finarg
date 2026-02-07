/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://www.bcra.gob.ar https://lh3.googleusercontent.com",
      `connect-src 'self' https://accounts.google.com ${isProd ? "https://finarg.vercel.app" : "http://localhost:8080"}`,
      "frame-src https://accounts.google.com",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["lucide-react"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bcra.gob.ar",
      },
    ],
  },
  compiler: {
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
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
        destination: `${process.env.BACKEND_URL || "http://localhost:8080"}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
