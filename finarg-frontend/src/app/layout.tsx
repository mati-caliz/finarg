import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinLatam - App Financiera Latinoamerica',
  description: 'Cotizaciones, calculadoras y herramientas financieras para Argentina, Colombia, Brasil, Chile y Uruguay',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinLatam',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://finlatam.app',
    siteName: 'FinLatam',
    title: 'FinLatam - App Financiera Latinoamerica',
    description: 'Cotizaciones del dolar, calculadoras y herramientas financieras para Latinoamerica',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinLatam - App Financiera Latinoamerica',
    description: 'Cotizaciones del dolar, calculadoras y herramientas financieras para Latinoamerica',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('finarg-theme');
                  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="lg:pl-64">
              <Navbar />
              <main className="p-4 lg:p-6">{children}</main>
            </div>
          </div>
        </Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
