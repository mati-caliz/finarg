"use client";

import { useAuthStore } from "@/store/useStore";
import { AlertCircle } from "lucide-react";

export function UsageBadge() {
  const { subscription } = useAuthStore();

  if (!subscription || subscription.plan !== "FREE") {
    return null;
  }

  const used = subscription.currentUsage?.calculationsUsedToday ?? 0;
  const limit = subscription.currentUsage?.calculationsLimit ?? 3;
  const remaining = limit - used;

  if (remaining <= 0) {
    return (
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-700 dark:text-red-300">
          <strong>Límite alcanzado.</strong> Has usado {used} de {limit} cálculos hoy.{" "}
          <a
            href="/planes"
            className="underline font-semibold hover:text-red-800 dark:hover:text-red-200"
          >
            Actualiza a Premium
          </a>{" "}
          para cálculos ilimitados.
        </p>
      </div>
    );
  }

  const isLow = remaining <= 1;

  return (
    <div
      className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
        isLow
          ? "bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
          : "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
      }`}
    >
      <AlertCircle
        className={`h-5 w-5 flex-shrink-0 ${
          isLow ? "text-orange-600 dark:text-orange-500" : "text-blue-600 dark:text-blue-500"
        }`}
      />
      <p
        className={`text-sm ${
          isLow ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"
        }`}
      >
        {remaining === 1 ? (
          <>
            <strong>¡Último cálculo gratis hoy!</strong> Actualiza a{" "}
            <a href="/planes" className="underline font-semibold">
              Premium
            </a>{" "}
            para cálculos ilimitados.
          </>
        ) : (
          <>
            Te quedan <strong>{remaining} cálculos gratis</strong> hoy ({used}/{limit} usados).
          </>
        )}
      </p>
    </div>
  );
}
