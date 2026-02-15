"use client";

import { logger } from "@/lib/logger";
import { useAuthStore } from "@/store/useStore";
import { useEffect } from "react";

interface GoogleAdProps {
  adSlot: string;
  adFormat?: "auto" | "fluid" | "rectangle";
  className?: string;
  style?: React.CSSProperties;
}

export function GoogleAd({ adSlot, adFormat = "auto", className = "", style }: GoogleAdProps) {
  const { subscription } = useAuthStore();

  useEffect(() => {
    if (subscription?.plan === "FREE" && typeof window !== "undefined") {
      try {
        const w = window as Window & { adsbygoogle?: unknown[] };
        if (!w.adsbygoogle) {
          w.adsbygoogle = [];
        }
        w.adsbygoogle.push({});
      } catch (err) {
        logger.error("AdSense error:", err);
      }
    }
  }, [subscription?.plan]);

  if (subscription?.plan !== "FREE") {
    return null;
  }

  return (
    <div className={`google-ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
