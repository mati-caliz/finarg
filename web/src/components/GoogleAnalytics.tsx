"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js",
      targetId: string | Date,
      config?: {
        [key: string]: string | number | boolean | undefined;
      },
    ) => void;
    dataLayer?: unknown[];
  }
}

export function GoogleAnalytics() {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!gaMeasurementId || typeof window === "undefined") {
      return;
    }

    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    if (!window.gtag) {
      window.gtag = function gtag(...args) {
        window.dataLayer?.push(...args);
      };
    }

    if (window.gtag && pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      window.gtag("config", gaMeasurementId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, gaMeasurementId]);

  if (!gaMeasurementId) {
    return null;
  }

  const handleScriptLoad = () => {
    if (typeof window !== "undefined" && window.gtag && gaMeasurementId) {
      window.gtag("js", new Date());
      window.gtag("config", gaMeasurementId, {
        page_path: window.location.pathname,
      });
    }
  };

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        onLoad={handleScriptLoad}
      />
    </>
  );
}
