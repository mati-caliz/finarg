"use client";

import { QuoteCard } from "@/components/dashboard/QuoteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getCountryConfig } from "@/config/countries";
import { useCountryRisk } from "@/hooks/useCountryRisk";
import { useCrypto } from "@/hooks/useCrypto";
import { useGap, useQuotes } from "@/hooks/useQuotes";
import { useReserves } from "@/hooks/useReserves";
import { useTranslation } from "@/hooks/useTranslation";

import { useAppStore } from "@/store/useStore";
import dynamic from "next/dynamic";
import Link from "next/link";

const BandsWidget = dynamic(
  () => import("@/components/dashboard/BandsWidget").then((mod) => ({ default: mod.BandsWidget })),
  { loading: () => <Skeleton className="h-full w-full rounded-xl" /> },
);

const GapGauge = dynamic(
  () => import("@/components/dashboard/GapGauge").then((mod) => ({ default: mod.GapGauge })),
  { loading: () => <Skeleton className="h-full w-full rounded-xl" /> },
);

const ReservesWidget = dynamic(
  () =>
    import("@/components/dashboard/ReservesWidget").then((mod) => ({
      default: mod.ReservesWidget,
    })),
  { loading: () => <Skeleton className="h-full w-full rounded-xl" /> },
);

const CountryRiskWidget = dynamic(
  () =>
    import("@/components/dashboard/CountryRiskWidget").then((mod) => ({
      default: mod.CountryRiskWidget,
    })),
  { loading: () => <Skeleton className="h-full w-full rounded-xl" /> },
);

const CryptoWidget = dynamic(
  () =>
    import("@/components/dashboard/CryptoWidget").then((mod) => ({ default: mod.CryptoWidget })),
  { loading: () => <Skeleton className="h-full w-full rounded-xl" /> },
);

const NextHolidayWidget = dynamic(
  () =>
    import("@/components/dashboard/NextHolidayWidget").then((mod) => ({
      default: mod.NextHolidayWidget,
    })),
  { loading: () => <Skeleton className="h-full w-full rounded-xl" /> },
);

const TopInvestmentRatesWidget = dynamic(
  () =>
    import("@/components/dashboard/TopRatesWidget").then((mod) => ({
      default: mod.TopInvestmentRatesWidget,
    })),
  { loading: () => <Skeleton className="h-full w-full rounded-xl" /> },
);

const TopMortgagesWidget = dynamic(
  () =>
    import("@/components/dashboard/TopMortgagesWidget").then((mod) => ({
      default: mod.TopMortgagesWidget,
    })),
  { loading: () => <Skeleton className="h-full w-full rounded-xl" /> },
);

const InflationWidget = dynamic(
  () =>
    import("@/components/dashboard/InflationWidget").then((mod) => ({
      default: mod.InflationWidget,
    })),
  { loading: () => <Skeleton className="h-full w-full rounded-xl" /> },
);

const SocialIndicatorsCard = dynamic(
  () =>
    import("@/components/dashboard/SocialIndicatorsCard").then((mod) => ({
      default: mod.SocialIndicatorsCard,
    })),
  { loading: () => <Skeleton className="h-full w-full rounded-xl" /> },
);

const OtherCurrenciesSection = dynamic(
  () =>
    import("@/components/dashboard/OtherCurrenciesSection").then((mod) => ({
      default: mod.OtherCurrenciesSection,
    })),
  { loading: () => <Skeleton className="h-32 w-full rounded-xl" /> },
);

const ToolsGrid = dynamic(
  () => import("@/components/dashboard/ToolsGrid").then((mod) => ({ default: mod.ToolsGrid })),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> },
);

export default function DashboardPage() {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryConfig = getCountryConfig(selectedCountry);

  const { data: quotes, isLoading: loadingQuotes } = useQuotes();
  const { data: gap } = useGap();
  const { data: reserves } = useReserves(selectedCountry);
  const { data: countryRisk } = useCountryRisk();
  const { data: cryptoList } = useCrypto();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{translate("dashboard")}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-success-accessible">
              {countryConfig.flag} {translate(selectedCountry)}
            </span>
            <span className="text-sm text-muted-foreground">{translate("marketSummary")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loadingQuotes ? (
          <>
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </>
        ) : (
          (quotes ?? [])
            .filter((quote) => ["blue", "oficial", "tarjeta", "bolsa"].includes(quote.type))
            .map((quote) => <QuoteCard key={quote.type} quote={quote} country={selectedCountry} />)
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {selectedCountry === "ar" && (
          <div className="flex flex-col gap-4 h-full min-h-0">
            {countryRisk && (
              <Link href="/riesgo-pais" className="block">
                <CountryRiskWidget countryRisk={countryRisk} />
              </Link>
            )}
            {cryptoList && cryptoList.length > 0 && <CryptoWidget cryptoList={cryptoList} />}
            <NextHolidayWidget />
            {countryConfig.features.inflation && <InflationWidget />}
          </div>
        )}

        {(countryConfig.features.gap || countryConfig.features.exchangeBands) && (
          <div className="flex flex-col gap-4 h-full min-h-0">
            {countryConfig.features.gap && gap && (
              <div className="shrink-0">
                <GapGauge gap={gap} />
              </div>
            )}
            {countryConfig.features.exchangeBands && (
              <div className="shrink-0">
                <BandsWidget officialQuote={quotes?.find((q) => q.type === "oficial")} />
              </div>
            )}
            {selectedCountry === "ar" && countryConfig.features.rates && (
              <div className="shrink-0">
                <TopInvestmentRatesWidget />
              </div>
            )}
          </div>
        )}

        {selectedCountry === "ar" && (
          <div className="flex flex-col gap-4 h-full min-h-0">
            {reserves && (
              <Link href="/reservas-bcra" className="block">
                <ReservesWidget
                  reserves={reserves}
                  label={
                    countryConfig.reservesLabelKey
                      ? translate(countryConfig.reservesLabelKey)
                      : countryConfig.reservesLabel
                  }
                />
              </Link>
            )}
            <SocialIndicatorsCard />
            {countryConfig.features.rates && <TopMortgagesWidget />}
          </div>
        )}

        {countryConfig.features.inflation && selectedCountry !== "ar" && <InflationWidget />}
      </div>

      <OtherCurrenciesSection />
      <ToolsGrid />
    </div>
  );
}
