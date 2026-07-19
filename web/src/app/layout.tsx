import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { CafecitoModal } from "@/components/CafecitoModal";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { EarlyHints } from "./early-hints";
import { Providers } from "./providers";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-archivo",
  adjustFontFallback: true,
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "La Brecha - Indicadores económicos de Argentina",
  description:
    "Inflación, reservas del BCRA, riesgo país, cotizaciones y calculadoras financieras de Argentina",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "La Brecha",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://labrecha.ar",
    siteName: "La Brecha",
    title: "La Brecha - Indicadores económicos de Argentina",
    description: "Inflación, reservas del BCRA, riesgo país y cotizaciones del dólar en Argentina",
  },
  twitter: {
    card: "summary_large_image",
    title: "La Brecha - Indicadores económicos de Argentina",
    description: "Inflación, reservas del BCRA, riesgo país y cotizaciones del dólar en Argentina",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  return (
    <html lang="es" className={`${archivo.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <EarlyHints />
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8080"}
        />
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8080"}
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={archivo.className}>
        {gaMeasurementId && (
          <>
            <Script
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}', {
            page_path: window.location.pathname,
          });
        `}
            </Script>
          </>
        )}
        <Providers>
          <div
            className="min-h-screen"
            style={{ background: "var(--bg-page)", color: "var(--text-body)" }}
          >
            <Sidebar />
            <div className="lg:pl-64">
              <Navbar />
              <main className="p-4 lg:p-6">{children}</main>
            </div>
          </div>
          <CafecitoModal />
        </Providers>
        <ServiceWorkerRegistration />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
