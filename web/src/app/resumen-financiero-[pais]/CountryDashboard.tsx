"use client";

import DashboardPage from "@/app/page";
import type { CountryCode } from "@/config/countries";
import { useAppStore } from "@/store/useStore";
import { useEffect } from "react";

interface CountryDashboardProps {
  countryCode: CountryCode;
}

export function CountryDashboard({ countryCode }: CountryDashboardProps) {
  const setSelectedCountry = useAppStore((state) => state.setSelectedCountry);

  useEffect(() => {
    setSelectedCountry(countryCode);
  }, [countryCode, setSelectedCountry]);

  return <DashboardPage />;
}
