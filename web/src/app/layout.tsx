import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { CafecitoModal } from "@/components/CafecitoModal";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { UpgradeBannerWrapper } from "@/components/UpgradeBannerWrapper";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { EarlyHints } from "./early-hints";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "FinLatam - App Financiera Latinoamerica",
  description:
    "Cotizaciones, calculadoras y herramientas financieras para Argentina, Colombia, Brasil, Chile y Uruguay",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FinLatam",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://finlatam.app",
    siteName: "FinLatam",
    title: "FinLatam - App Financiera Latinoamerica",
    description:
      "Cotizaciones del dolar, calculadoras y herramientas financieras para Latinoamerica",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinLatam - App Financiera Latinoamerica",
    description:
      "Cotizaciones del dolar, calculadoras y herramientas financieras para Latinoamerica",
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
    <html lang="es" suppressHydrationWarning>
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
      <body className={inter.className}>
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
          <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="lg:pl-64">
              <Navbar />
              <UpgradeBannerWrapper />
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
