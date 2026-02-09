"use client";

import { useAppStore } from "@/store/useStore";
import { useEffect } from "react";

export function HeadPrefetch() {
  const selectedCountry = useAppStore((state) => state.selectedCountry);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    const preloadQuotes = document.createElement("link");
    preloadQuotes.rel = "preload";
    preloadQuotes.href = `${apiUrl}/${selectedCountry}/quotes`;
    preloadQuotes.as = "fetch";
    preloadQuotes.setAttribute("crossorigin", "use-credentials");
    document.head.appendChild(preloadQuotes);

    const preloadGap = document.createElement("link");
    preloadGap.rel = "preload";
    preloadGap.href = `${apiUrl}/${selectedCountry}/quotes/gap`;
    preloadGap.as = "fetch";
    preloadGap.setAttribute("crossorigin", "use-credentials");
    document.head.appendChild(preloadGap);

    if (selectedCountry === "ar") {
      const preloadReserves = document.createElement("link");
      preloadReserves.rel = "preload";
      preloadReserves.href = `${apiUrl}/reserves?country=ar`;
      preloadReserves.as = "fetch";
      preloadReserves.setAttribute("crossorigin", "use-credentials");
      document.head.appendChild(preloadReserves);
    }

    return () => {
      document.head.removeChild(preloadQuotes);
      document.head.removeChild(preloadGap);
    };
  }, [selectedCountry]);

  return null;
}
