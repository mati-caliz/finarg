"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ExchangeRateComparatorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/conversor-universal");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
