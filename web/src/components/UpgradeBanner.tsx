"use client";

import { Crown, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function UpgradeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Crown className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            Accedé a calculadoras ilimitadas, alertas personalizadas y más con{" "}
            <span className="font-bold">Premium</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/pricing">
            <button
              type="button"
              className="bg-white text-orange-600 px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Ver Planes
            </button>
          </Link>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
