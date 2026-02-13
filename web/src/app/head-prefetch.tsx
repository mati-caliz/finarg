"use client";

import { useAppStore } from "@/store/useStore";
import { useEffect } from "react";

export function HeadPrefetch() {
  const selectedCountry = useAppStore((state) => state.selectedCountry);

  useEffect(() => {
    const preloadQuotes = document.createElement("link");
    preloadQuotes.rel = "preload";
    preloadQuotes.href = `/api/data/${selectedCountry}/quotes`;
    preloadQuotes.as = "fetch";
    document.head.appendChild(preloadQuotes);

    const preloadGap = document.createElement("link");
    preloadGap.rel = "preload";
    preloadGap.href = `/api/data/${selectedCountry}/quotes/gap`;
    preloadGap.as = "fetch";
    document.head.appendChild(preloadGap);

    if (selectedCountry === "ar") {
      const preloadReserves = document.createElement("link");
      preloadReserves.rel = "preload";
      preloadReserves.href = "/api/data/reserves?country=ar";
      preloadReserves.as = "fetch";
      document.head.appendChild(preloadReserves);
    }

    return () => {
      document.head.removeChild(preloadQuotes);
      document.head.removeChild(preloadGap);
    };
  }, [selectedCountry]);

  return null;
}
