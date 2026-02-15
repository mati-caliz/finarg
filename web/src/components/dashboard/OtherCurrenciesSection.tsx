"use client";

import { QuoteCard } from "@/components/dashboard/QuoteCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuotes } from "@/hooks/useQuotes";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { sortQuotesByVariant } from "@/lib/utils";
import { useAppStore } from "@/store/useStore";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

const OTHER_CURRENCY_PREFIXES = ["eur_", "brl_", "clp_", "uyu_", "pyg_", "bob_", "cny_"];

const CURRENCY_TRANSLATION_KEYS: Record<string, TranslationKey> = {
  eur: "currencyEuro",
  brl: "currencyReal",
  clp: "currencyClp",
  uyu: "currencyUyu",
  cop: "currencyCop",
  pyg: "currencyPyg",
  bob: "currencyBob",
  cny: "currencyCny",
};

const CURRENCY_SORT_PRIORITY: Record<string, number> = {
  eur: 0,
  brl: 1,
};

export function OtherCurrenciesSection() {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const { data: quotes } = useQuotes();
  const [selectedCurrency, setSelectedCurrency] = useState<string>("eur");

  const otherQuotes = useMemo(
    () =>
      quotes?.filter((q) => OTHER_CURRENCY_PREFIXES.some((prefix) => q.type.startsWith(prefix))),
    [quotes],
  );

  const availableCurrencies = useMemo(
    () =>
      Array.from(new Set(otherQuotes?.map((q) => q.type.split("_")[0]) ?? [])).sort((a, b) => {
        const priorityA = CURRENCY_SORT_PRIORITY[a] ?? 99;
        const priorityB = CURRENCY_SORT_PRIORITY[b] ?? 99;
        if (priorityA !== priorityB) return priorityA - priorityB;
        const nameA = translate(CURRENCY_TRANSLATION_KEYS[a] ?? "currencyDollar");
        const nameB = translate(CURRENCY_TRANSLATION_KEYS[b] ?? "currencyDollar");
        return nameA.localeCompare(nameB, "es");
      }),
    [otherQuotes, translate],
  );

  const filteredQuotesByCurrency = useMemo(
    () => otherQuotes?.filter((q) => q.type.startsWith(`${selectedCurrency}_`)),
    [otherQuotes, selectedCurrency],
  );

  if (!otherQuotes || otherQuotes.length === 0 || availableCurrencies.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-lg font-semibold">{translate("otherQuotes")}</h2>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[200px] justify-between">
              {translate(CURRENCY_TRANSLATION_KEYS[selectedCurrency] ?? "currencyDollar")}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-full sm:w-[200px]">
            {availableCurrencies.map((currency) => (
              <DropdownMenuItem key={currency} onClick={() => setSelectedCurrency(currency)}>
                {translate(CURRENCY_TRANSLATION_KEYS[currency] ?? "currencyDollar")}
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
  );
}
