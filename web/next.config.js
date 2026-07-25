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
    value: "ALLOW-FROM https://matiascaliz.com.ar",
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
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://statics.eleconomista.com.ar https://www.bcra.gob.ar https://icon.horse https://icons.com.ar https://lh3.googleusercontent.com https://www.google.com https://*.gstatic.com https://www.google-analytics.com",
      "connect-src 'self' https://accounts.google.com https://www.bcra.gob.ar https://icon.horse https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com",
      "frame-src https://accounts.google.com",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self' https://matiascaliz.com.ar",
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
      "@radix-ui/react-label",
      "@radix-ui/react-progress",
      "@radix-ui/react-select",
      "@radix-ui/react-slot",
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
      { source: "/ganancias", destination: "/calculator-net-salary", permanent: true },
      { source: "/reservas", destination: "/indicator/international_reserves", permanent: true },
      {
        source: "/reservas-bcra",
        destination: "/indicator/international_reserves",
        permanent: true,
      },
      { source: "/cotizaciones", destination: "/indicator/dollar_blue", permanent: true },
      { source: "/inflacion", destination: "/indicator/cpi_monthly", permanent: true },
      { source: "/riesgo-pais", destination: "/indicator/country_risk", permanent: true },
      { source: "/brechas", destination: "/gaps", permanent: true },
      { source: "/calculadoras", destination: "/calculators", permanent: true },
      { source: "/congreso", destination: "/congress", permanent: true },
      { source: "/congreso/votacion/:id", destination: "/congress/vote/:id", permanent: true },
      { source: "/estado", destination: "/status", permanent: true },
      { source: "/feriados", destination: "/holidays", permanent: true },
      { source: "/indicadores", destination: "/indicators", permanent: true },
      { source: "/indicador/:code", destination: "/indicator/:code", permanent: true },
      { source: "/noticias", destination: "/news", permanent: true },
      {
        source: "/calculadora-ajuste-inflacion",
        destination: "/calculator-inflation-adjustment",
        permanent: true,
      },
      {
        source: "/calculadora-impacto-fiscal",
        destination: "/calculator-fiscal-impact",
        permanent: true,
      },
      {
        source: "/calculadora-interes-compuesto",
        destination: "/calculator-compound-interest",
        permanent: true,
      },
      { source: "/calculadora-sueldo-neto", destination: "/calculator-net-salary", permanent: true },
      { source: "/boletin.xml", destination: "/gazette.xml", permanent: true },
    ];
  },
};

module.exports = nextConfig;
