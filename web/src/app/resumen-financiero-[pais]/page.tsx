import type { CountryCode } from "@/config/countries";
import { COUNTRIES } from "@/config/countries";
import { notFound } from "next/navigation";
import { CountryDashboard } from "./CountryDashboard";

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
  if (!params?.pais) {
    notFound();
  }

  const countryCode = COUNTRY_SLUG_MAP[params.pais.toLowerCase()];

  if (!countryCode || !COUNTRIES[countryCode]) {
    notFound();
  }

  return <CountryDashboard countryCode={countryCode} />;
}
