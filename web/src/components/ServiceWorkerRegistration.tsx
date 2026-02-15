"use client";

import { logger } from "@/lib/logger";
import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        logger.error("[SW] Service Worker registration failed:", error);
      });
    }
  }, []);

  return null;
}
