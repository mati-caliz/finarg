"use client";

import { GoogleAd } from "@/components/GoogleAd";
import { QuoteCard } from "@/components/dashboard/QuoteCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCountryConfig } from "@/config/countries";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCountryRisk } from "@/hooks/useCountryRisk";
import { useCrypto } from "@/hooks/useCrypto";
import { useCurrentInflation } from "@/hooks/useInflation";
import { useGap, useQuotes } from "@/hooks/useQuotes";
import { useReserves } from "@/hooks/useReserves";
import { useSocialIndicators } from "@/hooks/useSocialIndicators";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { formatCurrency, formatCurrencyNoDecimals, sortQuotesByVariant } from "@/lib/utils";
import { useAppStore, useAuthStore } from "@/store/useStore";
import {
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Calculator,
  ChevronDown,
  CreditCard,
  Crown,
  Percent,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";

const BandsWidget = dynamic(
  () => import("@/components/dashboard/BandsWidget").then((mod) => ({ default: mod.BandsWidget })),
  {
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  },
);

const GapGauge = dynamic(
  () => import("@/components/dashboard/GapGauge").then((mod) => ({ default: mod.GapGauge })),
  {
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  },
);

const ReservesWidget = dynamic(
  () =>
    import("@/components/dashboard/ReservesWidget").then((mod) => ({
      default: mod.ReservesWidget,
    })),
  {
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  },
);

const CountryRiskWidget = dynamic(
  () =>
    import("@/components/dashboard/CountryRiskWidget").then((mod) => ({
      default: mod.CountryRiskWidget,
    })),
  {
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  },
);

const CryptoWidget = dynamic(
  () =>
    import("@/components/dashboard/CryptoWidget").then((mod) => ({
      default: mod.CryptoWidget,
    })),
  {
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  },
);

const NextHolidayWidget = dynamic(
  () =>
    import("@/components/dashboard/NextHolidayWidget").then((mod) => ({
      default: mod.NextHolidayWidget,
    })),
  {
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  },
);

const TopInvestmentRatesWidget = dynamic(
  () =>
    import("@/components/dashboard/TopRatesWidget").then((mod) => ({
      default: mod.TopInvestmentRatesWidget,
    })),
  {
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  },
);

const TopMortgagesWidget = dynamic(
  () =>
    import("@/components/dashboard/TopMortgagesWidget").then((mod) => ({
      default: mod.TopMortgagesWidget,
    })),
  {
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  },
);

export default function DashboardPage() {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const { subscription } = useAuthStore();
  const countryConfig = getCountryConfig(selectedCountry);

  const { data: quotes, isLoading: loadingQuotes } = useQuotes();
  const { data: gap } = useGap();
  const { data: reserves } = useReserves(selectedCountry);

  const { data: inflation } = useCurrentInflation();
  const { data: socialIndicators } = useSocialIndicators(selectedCountry);
  const { data: countryRisk } = useCountryRisk();
  const { data: cryptoList } = useCrypto();

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
          sortQuotesByVariant(quotes ?? [])
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
            {countryConfig.features.inflation && (
              <Link href="/inflacion" className="block shrink-0">
                <Card className="border-t-[3px] border-t-red-400 transition-all hover:shadow-lg hover:border-red-300 cursor-pointer min-h-[160px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
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
                  </CardContent>
                </Card>
              </Link>
            )}
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
                <Card className="shrink-0 border-t-[3px] border-t-indigo-400 min-h-[380px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">
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
                              {formatCurrencyNoDecimals(socialIndicators.minimumSalary)}
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
                              {formatCurrencyNoDecimals(socialIndicators.minimumPension)}
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
                              {formatCurrencyNoDecimals(socialIndicators.totalBasicBasket)}
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
                              {formatCurrencyNoDecimals(socialIndicators.foodBasicBasket)}
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
                              {formatCurrencyNoDecimals(socialIndicators.ripteSalary)}
                            </p>
                          </div>
                        )}
                      {socialIndicators.uva !== undefined && socialIndicators.uva !== null && (
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{translate("uva")}</p>
                          <p className="text-lg font-semibold text-foreground">
                            {formatCurrency(socialIndicators.uva)}
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

            {countryConfig.features.rates && <TopMortgagesWidget />}
          </div>
        )}

        {countryConfig.features.inflation && selectedCountry !== "ar" && (
          <Link href="/inflacion" className="block">
            <Card className="border-t-[3px] border-t-red-400 transition-all hover:shadow-lg hover:border-red-300 cursor-pointer min-h-[160px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {translate("last12Months")}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15">
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {otherQuotes && otherQuotes.length > 0 && availableCurrencies.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-lg font-semibold">{translate("otherQuotes")}</h2>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[200px] justify-between">
                  {translate(currencyToTranslationKey[selectedCurrency] ?? "currencyDollar")}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-full sm:w-[200px]">
                {availableCurrencies.map((currency) => (
                  <DropdownMenuItem key={currency} onClick={() => setSelectedCurrency(currency)}>
                    {translate(currencyToTranslationKey[currency] ?? "currencyDollar")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {filteredQuotesByCurrency && filteredQuotesByCurrency.length > 0 && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {sortQuotesByVariant(filteredQuotesByCurrency).map((quote) => (
                <QuoteCard key={quote.type} quote={quote} country={selectedCountry} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{translate("tools")}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {countryConfig.features.incomeTax && (
            <Link href="/calculadora-sueldo-neto">
              <Card className="group cursor-pointer border-l-[3px] border-l-primary hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-[140px]">
                <CardContent className="pt-6 h-full flex items-center">
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{translate("incomeTaxCalculator")}</p>
                      <p className="text-sm text-muted-foreground">
                        {translate("incomeTaxSubtitle")}
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                      <Calculator className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {countryConfig.features.inflation && (
            <Link href="/inflacion">
              <Card className="group cursor-pointer border-l-[3px] border-l-accent hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 h-[140px]">
                <CardContent className="pt-6 h-full flex items-center">
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{translate("adjustmentCalculator")}</p>
                      <p className="text-sm text-muted-foreground">{translate("updateValues")}</p>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors shrink-0">
                      <Percent className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {countryConfig.features.rates && (
            <Link href="/comparador-tasas">
              <Card className="group cursor-pointer border-l-[3px] border-l-emerald-500 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 h-[140px]">
                <CardContent className="pt-6 h-full flex items-center">
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{translate("rateComparator")}</p>
                      <p className="text-sm text-muted-foreground">
                        {translate("rateComparatorSubtitle")}
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors shrink-0">
                      <BarChart3 className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          <Link href="/conversor-monedas">
            <Card className="group cursor-pointer border-l-[3px] border-l-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 h-[140px]">
              <CardContent className="pt-6 h-full flex items-center">
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{translate("exchangeRateComparator")}</p>
                    <p className="text-sm text-muted-foreground">
                      {translate("exchangeRateComparatorSubtitle")}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors shrink-0">
                    <ArrowLeftRight className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/calculadora-interes-compuesto">
            <Card className="group cursor-pointer border-l-[3px] border-l-violet-500 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 h-[140px]">
              <CardContent className="pt-6 h-full flex items-center">
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{translate("compoundInterestCalculator")}</p>
                    <p className="text-sm text-muted-foreground">
                      {translate("compoundInterestSubtitle")}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors shrink-0">
                    <TrendingUp className="h-6 w-6 text-violet-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {selectedCountry === "ar" && (
            <Link href="/calculadora-cuotas-contado">
              <Card className="group cursor-pointer border-l-[3px] border-l-orange-500 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 h-[140px]">
                <CardContent className="pt-6 h-full flex items-center">
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">¿Cuotas o Contado?</p>
                      <p className="text-sm text-muted-foreground">Calculá qué te conviene más</p>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors shrink-0">
                      <CreditCard className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {(!subscription || subscription.plan === "FREE") && (
            <Link href="/planes">
              <Card className="group cursor-pointer border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 hover:shadow-xl hover:shadow-yellow-400/20 transition-all duration-300 h-[140px] relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Popular
                </div>
                <CardContent className="pt-6 h-full flex items-center">
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                        <p className="font-bold text-yellow-900 dark:text-yellow-100">
                          Actualizá a Premium
                        </p>
                      </div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Cálculos ilimitados + Alertas + Sin ads
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors shrink-0">
                      <Sparkles className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        <GoogleAd
          adSlot="1234567890"
          adFormat="auto"
          className="mt-8"
          style={{ minHeight: "100px" }}
        />
      </div>
    </div>
  );
}
