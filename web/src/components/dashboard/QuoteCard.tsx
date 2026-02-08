"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CountryCode } from "@/config/countries";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { formatCurrencySimple } from "@/lib/utils";
import { useAppStore } from "@/store/useStore";
import type { Quote } from "@/types";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export interface QuoteCardProps {
  quote: Quote;
  country?: CountryCode;
}

const quoteAccentColors: Record<string, { border: string; bg: string; icon: string }> = {
  oficial: {
    border: "border-t-emerald-500",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    border: "border-t-blue-500",
    bg: "bg-blue-500/10",
    icon: "text-blue-600 dark:text-blue-400",
  },
  tarjeta: {
    border: "border-t-violet-500",
    bg: "bg-violet-500/10",
    icon: "text-violet-600 dark:text-violet-400",
  },
  bolsa: {
    border: "border-t-amber-500",
    bg: "bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
  },
  mayorista: {
    border: "border-t-cyan-500",
    bg: "bg-cyan-500/10",
    icon: "text-cyan-600 dark:text-cyan-400",
  },
  cripto: {
    border: "border-t-orange-500",
    bg: "bg-orange-500/10",
    icon: "text-orange-600 dark:text-orange-400",
  },
  ccl: {
    border: "border-t-pink-500",
    bg: "bg-pink-500/10",
    icon: "text-pink-600 dark:text-pink-400",
  },
};

const defaultAccent = {
  border: "border-t-slate-400",
  bg: "bg-slate-500/10",
  icon: "text-slate-600 dark:text-slate-400",
};

function getAccentForType(type: string) {
  const normalizedType = type.toLowerCase();
  for (const [key, value] of Object.entries(quoteAccentColors)) {
    if (normalizedType.includes(key)) {
      return value;
    }
  }
  return defaultAccent;
}

export function QuoteCard({ quote, country }: QuoteCardProps) {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || (quote.country as CountryCode) || selectedCountry;

  const variation = quote.variation || 0;
  const isPositive = variation > 0;
  const isNegative = variation < 0;

  const translated = translate(quote.type as TranslationKey);
  const displayName = translated === quote.type ? quote.name : translated;

  const isDollarQuote =
    quote.type.includes("OFFICIAL") ||
    quote.type.includes("BLUE") ||
    quote.type.includes("MEP") ||
    quote.type.includes("CCL") ||
    quote.type.includes("WHOLESALE") ||
    quote.type.includes("MAYORISTA") ||
    quote.type.includes("CARD") ||
    quote.type.includes("TARJETA") ||
    quote.type.includes("CRYPTO");

  const accent = getAccentForType(quote.type);

  return (
    <Card className={`border-t-[3px] ${accent.border} overflow-hidden`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${accent.border.replace("border-t-", "bg-")}`} />
          {displayName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight">
              {formatCurrencySimple(quote.sell, countryToUse)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {translate("buy")}: {formatCurrencySimple(quote.buy, countryToUse)}
            </p>
          </div>
          {isDollarQuote && (
            <div
              className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                isPositive
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15"
                  : isNegative
                    ? "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/15"
                    : "text-muted-foreground bg-muted"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : isNegative ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              <span className="text-xs font-medium">{variation.toFixed(2)}%</span>
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
          {translate("spread")}: {formatCurrencySimple(quote.spread, countryToUse)}
        </div>
      </CardContent>
    </Card>
  );
}
