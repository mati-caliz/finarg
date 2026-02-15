"use client";

import { useAuthStore } from "@/store/useStore";
import { UpgradeBanner } from "./UpgradeBanner";

export function UpgradeBannerWrapper() {
  const { subscription, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <UpgradeBanner />;
  }

  if (!subscription) return null;

  const isPremium = subscription.plan === "PREMIUM" || subscription.plan === "PROFESSIONAL";

  if (isPremium) return null;

  return <UpgradeBanner />;
}
