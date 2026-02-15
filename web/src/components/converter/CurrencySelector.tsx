"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/config/countries";
import type { CountryCode } from "@/config/countries";
import { useTranslation } from "@/hooks/useTranslation";
import type { CurrencyOption, Quote } from "@/types";
import { memo, useMemo, useState } from "react";

interface CurrencySelectorProps {
  label: string;
  value: CurrencyOption | null;
  onChange: (option: CurrencyOption) => void;
  allQuotes: Quote[];
  disabled?: boolean;
}

export const CurrencySelector = memo(
  ({ label, value, onChange, allQuotes, disabled }: CurrencySelectorProps) => {
    const { translate } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");

    const currencyOptions: CurrencyOption[] = useMemo(() => {
      const options: CurrencyOption[] = [];

      for (const [code, config] of Object.entries(COUNTRIES)) {
        const countryCode = code as CountryCode;
        const countryQuotes = allQuotes.filter((q) => q.country === countryCode);

        if (countryCode === "ar") {
          options.push({
            country: countryCode,
            countryName: config.name,
            currencyCode: "ars",
            currencyName: "Peso Argentino",
            baseCurrency: "ARS",
            flag: config.flag,
          });
        } else if (countryCode === "br") {
          options.push({
            country: countryCode,
            countryName: config.name,
            currencyCode: "brl",
            currencyName: "Real Brasileño",
            baseCurrency: "BRL",
            flag: config.flag,
          });
        } else if (countryCode === "cl") {
          options.push({
            country: countryCode,
            countryName: config.name,
            currencyCode: "clp",
            currencyName: "Peso Chileno",
            baseCurrency: "CLP",
            flag: config.flag,
          });
        } else if (countryCode === "co") {
          options.push({
            country: countryCode,
            countryName: config.name,
            currencyCode: "cop",
            currencyName: "Peso Colombiano",
            baseCurrency: "COP",
            flag: config.flag,
          });
        } else if (countryCode === "uy") {
          options.push({
            country: countryCode,
            countryName: config.name,
            currencyCode: "uyu",
            currencyName: "Peso Uruguayo",
            baseCurrency: "UYU",
            flag: config.flag,
          });
        }

        for (const quote of countryQuotes) {
          const baseCurrency = (quote.baseCurrency || "USD").toUpperCase();
          const currencyLabel =
            baseCurrency === "USD"
              ? "Dólar"
              : baseCurrency === "EUR"
                ? "Euro"
                : baseCurrency === "BRL"
                  ? "Real"
                  : baseCurrency === "CLP"
                    ? "Peso Chileno"
                    : baseCurrency === "UYU"
                      ? "Peso Uruguayo"
                      : baseCurrency === "COP"
                        ? "Peso Colombiano"
                        : baseCurrency === "ARS"
                          ? "Peso Argentino"
                          : baseCurrency;

          const fullName = `${currencyLabel} ${quote.name}`;

          options.push({
            country: countryCode,
            countryName: config.name,
            currencyCode: quote.type,
            currencyName: fullName,
            baseCurrency: baseCurrency,
            flag: config.flag,
          });
        }
      }

      return options;
    }, [allQuotes]);

    const groupedOptions = useMemo(() => {
      const grouped = new Map<string, CurrencyOption[]>();

      const priorityOrder: Record<string, number> = {
        ars: 0,
        brl: 0,
        clp: 0,
        cop: 0,
        uyu: 0,
        oficial: 1,
        blue: 2,
        mep: 3,
        bolsa: 3,
        ccl: 4,
        tarjeta: 5,
      };

      for (const option of currencyOptions) {
        const key = option.countryName;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)?.push(option);
      }

      for (const [, options] of grouped) {
        options.sort((a, b) => {
          const priorityA = priorityOrder[a.currencyCode] || 999;
          const priorityB = priorityOrder[b.currencyCode] || 999;
          return priorityA - priorityB;
        });
      }

      return grouped;
    }, [currencyOptions]);

    const filteredOptions = useMemo(() => {
      if (!searchQuery) return groupedOptions;

      const filtered = new Map<string, CurrencyOption[]>();
      const query = searchQuery.toLowerCase();

      for (const [countryName, options] of groupedOptions) {
        const matchedOptions = options.filter(
          (option) =>
            option.currencyName.toLowerCase().includes(query) ||
            option.currencyCode.toLowerCase().includes(query) ||
            option.countryName.toLowerCase().includes(query),
        );

        if (matchedOptions.length > 0) {
          filtered.set(countryName, matchedOptions);
        }
      }

      return filtered;
    }, [groupedOptions, searchQuery]);

    const getOptionLabel = (option: CurrencyOption) =>
      `${option.flag} ${option.countryName} - ${option.currencyName}`;

    const getOptionKey = (option: CurrencyOption) => `${option.country}-${option.currencyCode}`;

    const handleValueChange = (optionKey: string) => {
      const option = currencyOptions.find((o) => getOptionKey(o) === optionKey);
      if (option) {
        onChange(option);
      }
    };

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input
          type="text"
          placeholder={translate("searchCurrency")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
        />
        <Select
          value={value ? getOptionKey(value) : undefined}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={value ? getOptionLabel(value) : translate("selectFromCurrency")}
            >
              {value && getOptionLabel(value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {filteredOptions.size === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron monedas
              </div>
            ) : (
              Array.from(filteredOptions.entries()).map(([countryName, options]) => (
                <SelectGroup key={countryName}>
                  <SelectLabel>{countryName}</SelectLabel>
                  {options.map((option) => (
                    <SelectItem key={getOptionKey(option)} value={getOptionKey(option)}>
                      {option.flag} {option.currencyName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    );
  },
);

CurrencySelector.displayName = "CurrencySelector";
