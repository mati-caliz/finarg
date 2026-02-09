"use client";

import { QuoteCard } from "@/components/dashboard/QuoteCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCountryConfig } from "@/config/countries";

import { useCountryRisk } from "@/hooks/useCountryRisk";
import { useCurrentInflation } from "@/hooks/useInflation";
import { useGap, useQuotes } from "@/hooks/useQuotes";
import { useReserves } from "@/hooks/useReserves";
import { useSocialIndicators } from "@/hooks/useSocialIndicators";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { sortQuotesByVariant } from "@/lib/utils";
import { useAppStore } from "@/store/useStore";
import { ArrowRight, Calculator, ChevronDown, Loader2, Percent, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";

const BandsWidget = dynamic(
  () => import("@/components/dashboard/BandsWidget").then((mod) => ({ default: mod.BandsWidget })),
  { ssr: false },
);
const CountryRiskWidget = dynamic(
  () =>
    import("@/components/dashboard/CountryRiskWidget").then((mod) => ({
      default: mod.CountryRiskWidget,
    })),
  { ssr: false },
);
const GapGauge = dynamic(
  () => import("@/components/dashboard/GapGauge").then((mod) => ({ default: mod.GapGauge })),
  { ssr: false },
);
const ReservesWidget = dynamic(
  () =>
    import("@/components/dashboard/ReservesWidget").then((mod) => ({
      default: mod.ReservesWidget,
    })),
  { ssr: false },
);
const DropdownMenu = dynamic(
  () => import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenu })),
  { ssr: false },
);
const DropdownMenuContent = dynamic(
  () =>
    import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuContent })),
  { ssr: false },
);
const DropdownMenuItem = dynamic(
  () => import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuItem })),
  { ssr: false },
);
const DropdownMenuTrigger = dynamic(
  () =>
    import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuTrigger })),
  { ssr: false },
);

export default function DashboardPage() {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryConfig = getCountryConfig(selectedCountry);

  const { data: quotes, isLoading: loadingQuotes } = useQuotes();
  const { data: gap, isLoading: loadingGap } = useGap();
  const { data: reserves, isLoading: loadingReserves } = useReserves(selectedCountry);

  const { data: inflation } = useCurrentInflation();
  const { data: socialIndicators } = useSocialIndicators(selectedCountry);
  const { data: countryRisk } = useCountryRisk();

  const otherQuotes = useMemo(
    () =>
      quotes?.filter(
        (q) =>
          q.type.startsWith("eur_") ||
          q.type.startsWith("brl_") ||
          q.type.startsWith("clp_") ||
          q.type.startsWith("uyu_") ||
          q.type.startsWith("pyg_") ||
          q.type.startsWith("bob_") ||
          q.type.startsWith("cny_"),
      ),
    [quotes],
  );

  const currencyToTranslationKey: Record<string, TranslationKey> = useMemo(
    () => ({
      eur: "currencyEuro",
      brl: "currencyReal",
      clp: "currencyClp",
      uyu: "currencyUyu",
      cop: "currencyCop",
      pyg: "currencyPyg",
      bob: "currencyBob",
      cny: "currencyCny",
    }),
    [],
  );

  const availableCurrencies = useMemo(
    () =>
      Array.from(new Set(otherQuotes?.map((q) => q.type.split("_")[0]) ?? [])).sort((a, b) => {
        if (a === "eur") {
          return -1;
        }
        if (b === "eur") {
          return 1;
        }
        if (a === "brl") {
          return -1;
        }
        if (b === "brl") {
          return 1;
        }
        const nameA = translate(currencyToTranslationKey[a] ?? "currencyDollar");
        const nameB = translate(currencyToTranslationKey[b] ?? "currencyDollar");
        return nameA.localeCompare(nameB, "es");
      }),
    [otherQuotes, translate, currencyToTranslationKey],
  );

  const [selectedCurrency, setSelectedCurrency] = useState<string>("eur");

  const filteredQuotesByCurrency = useMemo(
    () => otherQuotes?.filter((q) => q.type.startsWith(`${selectedCurrency}_`)),
    [otherQuotes, selectedCurrency],
  );

  if (loadingQuotes || loadingGap || (selectedCountry === "ar" && loadingReserves)) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{translate("dashboard")}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-success-accessible">
              {countryConfig.flag} {translate(selectedCountry)}
            </span>
            <span className="text-sm text-muted-foreground">{translate("marketSummary")}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sortQuotesByVariant(quotes ?? [])
          .filter((quote) => ["blue", "oficial", "tarjeta", "bolsa"].includes(quote.type))
          .map((quote) => (
            <QuoteCard key={quote.type} quote={quote} country={selectedCountry} />
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(countryConfig.features.gap || countryConfig.features.exchangeBands) && (
          <div className="flex flex-col gap-4 h-full min-h-0">
            {countryConfig.features.gap && gap && (
              <div className="shrink-0">
                <GapGauge gap={gap} />
              </div>
            )}
            {countryConfig.features.exchangeBands && (
              <div className="flex-1">
                <BandsWidget oficialQuote={quotes?.find((q) => q.type === "oficial")} />
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

            {socialIndicators &&
              ((socialIndicators.minimumSalary !== undefined &&
                socialIndicators.minimumSalary !== null) ||
                (socialIndicators.minimumPension !== undefined &&
                  socialIndicators.minimumPension !== null) ||
                (socialIndicators.totalBasicBasket !== undefined &&
                  socialIndicators.totalBasicBasket !== null) ||
                (socialIndicators.foodBasicBasket !== undefined &&
                  socialIndicators.foodBasicBasket !== null) ||
                (socialIndicators.ripteSalary !== undefined &&
                  socialIndicators.ripteSalary !== null) ||
                (socialIndicators.uva !== undefined && socialIndicators.uva !== null) ||
                (socialIndicators.cer !== undefined && socialIndicators.cer !== null)) && (
                <Card className="shrink-0 border-t-[3px] border-t-indigo-400">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {translate("socialIndicators")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {socialIndicators.minimumSalary !== undefined &&
                        socialIndicators.minimumSalary !== null && (
                          <div className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">
                              {translate("minimumSalary")}
                            </p>
                            <p className="text-lg font-semibold text-foreground">
                              {new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                                maximumFractionDigits: 0,
                              }).format(socialIndicators.minimumSalary)}
                            </p>
                          </div>
                        )}
                      {socialIndicators.minimumPension !== undefined &&
                        socialIndicators.minimumPension !== null && (
                          <div className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">
                              {translate("minimumPension")}
                            </p>
                            <p className="text-lg font-semibold text-foreground">
                              {new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                                maximumFractionDigits: 0,
                              }).format(socialIndicators.minimumPension)}
                            </p>
                          </div>
                        )}
                      {socialIndicators.totalBasicBasket !== undefined &&
                        socialIndicators.totalBasicBasket !== null && (
                          <div className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">
                              {translate("canastaBasicaTotal")}
                            </p>
                            <p className="text-lg font-semibold text-foreground">
                              {new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                                maximumFractionDigits: 0,
                              }).format(socialIndicators.totalBasicBasket)}
                            </p>
                          </div>
                        )}
                      {socialIndicators.foodBasicBasket !== undefined &&
                        socialIndicators.foodBasicBasket !== null && (
                          <div className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">
                              {translate("canastaBasicaAlimentaria")}
                            </p>
                            <p className="text-lg font-semibold text-foreground">
                              {new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                                maximumFractionDigits: 0,
                              }).format(socialIndicators.foodBasicBasket)}
                            </p>
                          </div>
                        )}
                      {socialIndicators.ripteSalary !== undefined &&
                        socialIndicators.ripteSalary !== null && (
                          <div className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">
                              {translate("salarioRipte")}
                            </p>
                            <p className="text-lg font-semibold text-foreground">
                              {new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                                maximumFractionDigits: 0,
                              }).format(socialIndicators.ripteSalary)}
                            </p>
                          </div>
                        )}
                      {socialIndicators.uva !== undefined && socialIndicators.uva !== null && (
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{translate("uva")}</p>
                          <p className="text-lg font-semibold text-foreground">
                            {new Intl.NumberFormat("es-AR", {
                              style: "currency",
                              currency: "ARS",
                              minimumFractionDigits: 2,
                            }).format(socialIndicators.uva)}
                          </p>
                        </div>
                      )}
                      {socialIndicators.cer !== undefined && socialIndicators.cer !== null && (
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{translate("cer")}</p>
                          <p className="text-lg font-semibold text-foreground">
                            {socialIndicators.cer.toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                    <Link
                      href="/calculadora-sueldo-neto"
                      className="inline-flex items-center gap-1 text-sm text-success-accessible hover:underline mt-4"
                    >
                      {translate("incomeTaxCalculator")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              )}
          </div>
        )}

        {selectedCountry === "ar" && (
          <div className="flex flex-col gap-4 h-full min-h-0">
            {countryRisk && <CountryRiskWidget countryRisk={countryRisk} />}

            {countryConfig.features.inflation && (
              <Card className="shrink-0 border-t-[3px] border-t-red-400">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Percent className="h-3.5 w-3.5" />
                    {translate("monthlyInflation")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-red-500">
                        {inflation?.value?.toFixed(1) ?? "0"}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {translate("last12Months")}
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                  <Link
                    href="/inflacion"
                    className="inline-flex items-center gap-1 text-sm text-success-accessible hover:underline mt-4"
                  >
                    {translate("viewHistory")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {countryConfig.features.inflation && selectedCountry !== "ar" && (
          <Card className="border-t-[3px] border-t-red-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Percent className="h-3.5 w-3.5" />
                {translate("monthlyInflation")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-500">
                    {inflation?.value?.toFixed(1) ?? "0"}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{translate("last12Months")}</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                </div>
              </div>
              <Link
                href="/inflacion"
                className="inline-flex items-center gap-1 text-sm text-success-accessible hover:underline mt-4"
              >
                {translate("viewHistory")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {otherQuotes && otherQuotes.length > 0 && availableCurrencies.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-lg font-semibold">{translate("otherQuotes")}</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[200px] justify-between">
                  {translate(currencyToTranslationKey[selectedCurrency] ?? "currencyDollar")}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full sm:w-[200px]">
                {availableCurrencies.map((currency) => (
                  <DropdownMenuItem key={currency} onClick={() => setSelectedCurrency(currency)}>
                    {translate(currencyToTranslationKey[currency] ?? "currencyDollar")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {filteredQuotesByCurrency && filteredQuotesByCurrency.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortQuotesByVariant(filteredQuotesByCurrency).map((quote) => (
                <QuoteCard key={quote.type} quote={quote} country={selectedCountry} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {countryConfig.features.incomeTax && (
          <Link href="/calculadora-sueldo-neto">
            <Card className="group cursor-pointer border-l-[3px] border-l-primary hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{translate("incomeTaxCalculator")}</p>
                    <p className="text-sm text-muted-foreground">
                      {translate("incomeTaxSubtitle")}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {countryConfig.features.inflation && (
          <Link href="/inflacion">
            <Card className="group cursor-pointer border-l-[3px] border-l-accent hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{translate("adjustmentCalculator")}</p>
                    <p className="text-sm text-muted-foreground">{translate("updateValues")}</p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <Percent className="h-5 w-5 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
