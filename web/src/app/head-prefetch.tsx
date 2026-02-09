"use client";

import { useEffect } from "react";

export function HeadPrefetch() {
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = apiUrl.replace("/api/v1", "");
    document.head.appendChild(link);

    const quotesLink = document.createElement("link");
    quotesLink.rel = "prefetch";
    quotesLink.href = `${apiUrl}/ar/quotes`;
    quotesLink.as = "fetch";
    quotesLink.setAttribute("crossorigin", "use-credentials");
    document.head.appendChild(quotesLink);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(quotesLink);
    };
  }, []);

  return null;
}
