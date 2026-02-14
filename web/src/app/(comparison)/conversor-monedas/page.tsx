"use client";

import { ConversionHistoryCard } from "@/components/converter/ConversionHistoryCard";
import { ConversionResult } from "@/components/converter/ConversionResult";
import { CurrencySelector } from "@/components/converter/CurrencySelector";
import { SwapButton } from "@/components/converter/SwapButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CountryCode } from "@/config/countries";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useQuotes } from "@/hooks/useQuotes";
import { useTranslation } from "@/hooks/useTranslation";
import type {
  ConversionHistory,
  CurrencyConversionRequest,
  CurrencyConversionResponse,
  CurrencyOption,
  PriceType,
} from "@/types";
import { ArrowLeftRight, Calculator, History, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "currency-conversion-history";
const MAX_HISTORY = 10;

function loadHistory(): ConversionHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: ConversionHistory[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save history:", error);
  }
}

export default function UniversalConverterPage() {
  const { translate } = useTranslation();
  const [fromCurrency, setFromCurrency] = useState<CurrencyOption | null>(null);
  const [toCurrency, setToCurrency] = useState<CurrencyOption | null>(null);
  const [amount, setAmount] = useState<string>("100");
  const [fromPriceType, setFromPriceType] = useState<PriceType>("SELL");
  const [toPriceType, setToPriceType] = useState<PriceType>("BUY");
  const [conversionResult, setConversionResult] = useState<CurrencyConversionResponse | null>(null);
  const [history, setHistory] = useState<ConversionHistory[]>([]);

  const { data: argentinaQuotes = [], isLoading: loadingAr } = useQuotes("ar");
  const { data: colombiaQuotes = [], isLoading: loadingCo } = useQuotes("co");
  const { data: brazilQuotes = [], isLoading: loadingBr } = useQuotes("br");
  const { data: chileQuotes = [], isLoading: loadingCl } = useQuotes("cl");
  const { data: uruguayQuotes = [], isLoading: loadingUy } = useQuotes("uy");

  const allQuotes = useMemo(
    () => [
      ...argentinaQuotes.map((q) => ({ ...q, country: "ar" as const })),
      ...colombiaQuotes.map((q) => ({ ...q, country: "co" as const })),
      ...brazilQuotes.map((q) => ({ ...q, country: "br" as const })),
      ...chileQuotes.map((q) => ({ ...q, country: "cl" as const })),
      ...uruguayQuotes.map((q) => ({ ...q, country: "uy" as const })),
    ],
    [argentinaQuotes, colombiaQuotes, brazilQuotes, chileQuotes, uruguayQuotes],
  );

  const isLoadingQuotes = loadingAr || loadingCo || loadingBr || loadingCl || loadingUy;

  const { mutate: convert, isPending } = useCurrencyConversion();

  useEffect(() => {
    if (allQuotes.length > 0) {
      if (!fromCurrency && !toCurrency) {
        setFromCurrency({
          country: "ar",
          countryName: "Argentina",
          currencyCode: "ars",
          currencyName: "Peso Argentino",
          baseCurrency: "ARS",
          flag: "🇦🇷",
        });

        const defaultTo = allQuotes.find((q) => q.type === "blue" && q.country === "ar");
        if (defaultTo) {
          setToCurrency({
            country: "ar",
            countryName: "Argentina",
            currencyCode: defaultTo.type,
            currencyName: `Dólar ${defaultTo.name}`,
            baseCurrency: (defaultTo.baseCurrency || "USD").toUpperCase(),
            flag: "🇦🇷",
          });
        }
      }
    }
  }, [allQuotes, fromCurrency, toCurrency]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleSwap = () => {
    const tempCurrency = fromCurrency;
    const tempPriceType = fromPriceType;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    setFromPriceType(toPriceType);
    setToPriceType(tempPriceType);
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromCurrency || !toCurrency || !amount) {
      return;
    }

    const amountNum = Number.parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    const request: CurrencyConversionRequest = {
      fromCountry: fromCurrency.country,
      fromCurrency: fromCurrency.currencyCode,
      toCountry: toCurrency.country,
      toCurrency: toCurrency.currencyCode,
      amount: amountNum,
      fromPriceType,
      toPriceType,
    };

    convert(request, {
      onSuccess: (data) => {
        setConversionResult(data);

        const newHistoryItem: ConversionHistory = {
          ...data,
          id: `${Date.now()}-${Math.random()}`,
        };

        const updatedHistory = [newHistoryItem, ...history].slice(0, MAX_HISTORY);
        setHistory(updatedHistory);
        saveHistory(updatedHistory);
      },
      onError: (error) => {
        console.error("Conversion error:", error);
      },
    });
  };

  const handleReplayConversion = (conversion: ConversionHistory) => {
    const fromOpt = allQuotes.find(
      (q) => q.country === conversion.fromCountry && q.type === conversion.fromCurrency,
    );
    const toOpt = allQuotes.find(
      (q) => q.country === conversion.toCountry && q.type === conversion.toCurrency,
    );

    if (fromOpt && toOpt) {
      setFromCurrency({
        country: conversion.fromCountry as CountryCode,
        countryName: fromOpt.name,
        currencyCode: conversion.fromCurrency,
        currencyName: fromOpt.name,
        baseCurrency: fromOpt.baseCurrency || "USD",
        flag: "",
      });

      setToCurrency({
        country: conversion.toCountry as CountryCode,
        countryName: toOpt.name,
        currencyCode: conversion.toCurrency,
        currencyName: toOpt.name,
        baseCurrency: toOpt.baseCurrency || "USD",
        flag: "",
      });

      setAmount(conversion.fromAmount.toString());
      setFromPriceType(conversion.conversionRate.fromPriceType as PriceType);
      setToPriceType(conversion.conversionRate.toPriceType as PriceType);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ArrowLeftRight className="h-6 w-6" />
          {translate("universalConverter")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{translate("universalConverterDesc")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {translate("convertCurrency")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingQuotes && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Cargando monedas...</span>
            </div>
          )}
          {!isLoadingQuotes && allQuotes.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No se pudieron cargar las monedas. Verificá que el backend esté corriendo.
              </p>
            </div>
          )}
          {!isLoadingQuotes && allQuotes.length > 0 && (
            <form onSubmit={handleConvert} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
                <div className="space-y-4">
                  <CurrencySelector
                    label={translate("fromCurrency")}
                    value={fromCurrency}
                    onChange={setFromCurrency}
                    allQuotes={allQuotes}
                    disabled={isPending}
                  />
                  <div className="space-y-2">
                    <Label>{translate("amount")}</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={translate("enterAmount")}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{translate("priceType")}</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={fromPriceType === "BUY" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFromPriceType("BUY")}
                        disabled={isPending}
                        className="flex-1"
                      >
                        {translate("buying")}
                      </Button>
                      <Button
                        type="button"
                        variant={fromPriceType === "SELL" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFromPriceType("SELL")}
                        disabled={isPending}
                        className="flex-1"
                      >
                        {translate("selling")}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center md:pt-8">
                  <SwapButton onClick={handleSwap} />
                </div>

                <div className="space-y-4">
                  <CurrencySelector
                    label={translate("toCurrency")}
                    value={toCurrency}
                    onChange={setToCurrency}
                    allQuotes={allQuotes}
                    disabled={isPending}
                  />
                  <div className="space-y-2">
                    <Label>{translate("result")}</Label>
                    <Input
                      type="text"
                      value={
                        conversionResult
                          ? conversionResult.toAmount.toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : ""
                      }
                      placeholder="-"
                      disabled
                      className="font-mono text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{translate("priceType")}</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={toPriceType === "BUY" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setToPriceType("BUY")}
                        disabled={isPending}
                        className="flex-1"
                      >
                        {translate("buying")}
                      </Button>
                      <Button
                        type="button"
                        variant={toPriceType === "SELL" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setToPriceType("SELL")}
                        disabled={isPending}
                        className="flex-1"
                      >
                        {translate("selling")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending || !fromCurrency || !toCurrency || !amount}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate("convertButton")}...
                  </>
                ) : (
                  translate("convertButton")
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {conversionResult && <ConversionResult result={conversionResult} />}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {translate("conversionHistory")}
              </CardTitle>
              <Button type="button" variant="ghost" size="sm" onClick={handleClearHistory}>
                <Trash2 className="mr-2 h-4 w-4" />
                {translate("clearHistory")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((conversion) => (
              <ConversionHistoryCard
                key={conversion.id}
                conversion={conversion}
                onReplay={handleReplayConversion}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
