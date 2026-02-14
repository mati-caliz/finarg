/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

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
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      isProd
        ? "script-src 'self' 'unsafe-inline' https://accounts.google.com https://www.googletagmanager.com"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://www.bcra.gob.ar https://icon.horse https://icons.com.ar https://lh3.googleusercontent.com https://www.google.com https://*.gstatic.com https://www.google-analytics.com",
      [
        "connect-src 'self' https://accounts.google.com https://www.bcra.gob.ar https://icon.horse https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com",
        !isProd && "http://localhost:8080",
        backendUrl.replace("/api/v1", ""),
      ]
        .filter(Boolean)
        .join(" "),
      "frame-src https://accounts.google.com",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ]
      .filter(Boolean)
      .join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["lucide-react"],
  compress: true,
  poweredByHeader: false,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bcra.gob.ar",
      },
      {
        protocol: "https",
        hostname: "icon.horse",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.gstatic.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  compiler: {
    removeConsole: isProd
      ? {
          exclude: ["error", "warn"],
        }
      : false,
    reactRemoveProperties: isProd,
  },
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
    ],
    optimizeCss: true,
    webpackBuildWorker: true,
  },
  modularizeImports: {
    "date-fns": {
      transform: "date-fns/{{member}}",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icon.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, must-revalidate",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/ganancias", destination: "/calculadora-sueldo-neto", permanent: true },
      { source: "/simulador", destination: "/simulador-de-inversiones", permanent: true },
      { source: "/reservas", destination: "/reservas-bcra", permanent: true },
      { source: "/tasas", destination: "/comparador-tasas", permanent: true },
      { source: "/conversor-universal", destination: "/conversor-monedas", permanent: true },
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
