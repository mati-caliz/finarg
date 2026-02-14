"use client";

import { usePathname, useSearchParams } from "next/navigation";
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
    if (!gaMeasurementId || typeof window === "undefined" || !window.gtag) {
      return;
    }

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    window.gtag("config", gaMeasurementId, {
      page_path: url,
    });
  }, [pathname, searchParams, gaMeasurementId]);

  return null;
}
