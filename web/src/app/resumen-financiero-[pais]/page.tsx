"use client";

import DashboardPage from "@/app/page";
import type { CountryCode } from "@/config/countries";
import { COUNTRIES } from "@/config/countries";
import { useAppStore } from "@/store/useStore";
import { notFound } from "next/navigation";
import { useEffect } from "react";

const COUNTRY_SLUG_MAP: Record<string, CountryCode> = {
  ar: "ar",
  argentina: "ar",
  co: "co",
  colombia: "co",
  br: "br",
  brasil: "br",
  cl: "cl",
  chile: "cl",
  uy: "uy",
  uruguay: "uy",
};

export async function generateStaticParams() {
  return Object.keys(COUNTRY_SLUG_MAP).map((pais) => ({
    pais,
  }));
}

export default function CountryDashboardPage({ params }: { params: { pais: string } }) {
  const setSelectedCountry = useAppStore((state) => state.setSelectedCountry);
  const countryCode = COUNTRY_SLUG_MAP[params.pais.toLowerCase()];

  useEffect(() => {
    if (countryCode && COUNTRIES[countryCode]) {
      setSelectedCountry(countryCode);
    }
  }, [countryCode, setSelectedCountry]);

  if (!countryCode || !COUNTRIES[countryCode]) {
    notFound();
  }

  return <DashboardPage />;
}
