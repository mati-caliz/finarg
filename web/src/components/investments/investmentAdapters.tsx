import { VariationBadge } from "@/components/ui/variation-badge";
import type { TranslationKey } from "@/i18n/translations";
import { formatNumber, formatPercent, formatPrice } from "@/lib/utils";
import type { Bond, Caucion, Cedear, Crypto, Etf, Letra, Metal, Stock } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { InvestmentCardProps } from "./InvestmentCard";

export const INVESTMENT_BORDER_COLORS = {
  stocks: "border-t-blue-500",
  cedears: "border-t-amber-500",
  etfs: "border-t-cyan-500",
  bonds: "border-t-violet-500",
  letras: "border-t-blue-500",
  cauciones: "border-t-orange-500",
  crypto: "border-t-orange-500",
} as const;

export const METAL_BORDER_COLORS: Record<string, string> = {
  GOLD: "border-t-yellow-500",
  SILVER: "border-t-gray-400",
  PLATINUM: "border-t-slate-300",
  PALLADIUM: "border-t-zinc-400",
};

const METAL_NAME_KEYS: Record<string, TranslationKey> = {
  GOLD: "goldPrice",
  SILVER: "silverPrice",
  PLATINUM: "platinumPrice",
  PALLADIUM: "palladiumPrice",
};

type TranslateFn = (key: TranslationKey) => string;

export function stockToCardProps(stock: Stock): InvestmentCardProps {
  return {
    borderColor: INVESTMENT_BORDER_COLORS.stocks,
    title: stock.ticker,
    subtitle: stock.companyName,
    primaryValue: formatPrice(stock.currentPrice, stock.currency),
    change: stock.change,
    changePercent: stock.changePercent,
    changeFormatted: formatPrice(stock.change, stock.currency),
  };
}

export function cedearToCardProps(cedear: Cedear): InvestmentCardProps {
  return {
    borderColor: INVESTMENT_BORDER_COLORS.cedears,
    title: cedear.symbol,
    subtitle: cedear.companyName,
    primaryValue: formatPrice(cedear.lastPrice, cedear.currency),
    change: cedear.change,
    changePercent: cedear.changePercent,
    changeFormatted: formatPrice(cedear.change, cedear.currency),
  };
}

export function etfToCardProps(etf: Etf): InvestmentCardProps {
  return {
    borderColor: INVESTMENT_BORDER_COLORS.etfs,
    title: etf.ticker,
    subtitle: etf.name,
    primaryValue: formatPrice(etf.price, etf.currency),
    change: etf.change,
    changePercent: etf.changePercent,
    changeFormatted: formatPrice(etf.change, etf.currency),
  };
}

export function cryptoToCardProps(crypto: Crypto): InvestmentCardProps {
  return {
    borderColor: INVESTMENT_BORDER_COLORS.crypto,
    title: crypto.symbol,
    subtitle: crypto.name,
    primaryValue: formatPrice(crypto.priceUsd, "USD"),
    change: crypto.change24h,
    changeFormatted: `${crypto.change24h >= 0 ? "+" : ""}${crypto.change24h.toFixed(2)}%`,
  };
}

export function bondToCardProps(bond: Bond, translate: TranslateFn): InvestmentCardProps {
  return {
    borderColor: INVESTMENT_BORDER_COLORS.bonds,
    title: bond.ticker,
    subtitle: bond.name,
    primaryValue: formatPrice(bond.price, bond.currency),
    icon: <span className="text-xs text-muted-foreground">{bond.rating}</span>,
    secondaryInfo: [
      { label: translate("yield"), value: `${bond.yieldPercent.toFixed(2)}%` },
      {
        label: translate("maturity"),
        value: format(new Date(bond.maturity), "dd MMM yyyy", { locale: es }),
      },
    ],
    footer: bond.issuer ? (
      <p className="text-xs text-muted-foreground truncate">{bond.issuer}</p>
    ) : undefined,
  };
}

export function letraToCardProps(letra: Letra, translate: TranslateFn): InvestmentCardProps {
  return {
    borderColor: INVESTMENT_BORDER_COLORS.letras,
    title: letra.ticker,
    subtitle: letra.name,
    primaryValue: formatPrice(letra.price, letra.currency),
    change: letra.change,
    icon: <VariationBadge variation={letra.changePercent} />,
    secondaryInfo: [
      { label: translate("volume"), value: formatNumber(letra.volume, 0) },
      { label: translate("change"), value: formatPrice(letra.change, letra.currency) },
    ],
  };
}

export function caucionToCardProps(caucion: Caucion, translate: TranslateFn): InvestmentCardProps {
  return {
    borderColor: INVESTMENT_BORDER_COLORS.cauciones,
    title: caucion.ticker,
    subtitle: `${caucion.days} ${caucion.days === 1 ? translate("day") : translate("days")}`,
    primaryValue: formatPercent(caucion.rate),
    change: caucion.change,
    icon: <VariationBadge variation={caucion.changePercent} />,
    secondaryInfo: [
      { label: translate("minimum"), value: formatPercent(caucion.minRate) },
      { label: translate("maximum"), value: formatPercent(caucion.maxRate) },
    ],
  };
}

export function metalToCardProps(metal: Metal, translate: TranslateFn): InvestmentCardProps {
  return {
    borderColor: METAL_BORDER_COLORS[metal.metalType] ?? "border-t-gray-500",
    title: METAL_NAME_KEYS[metal.metalType]
      ? translate(METAL_NAME_KEYS[metal.metalType])
      : metal.metalType,
    subtitle: `${translate("per")} ${metal.unit}`,
    primaryValue: formatPrice(metal.priceUsd, "USD"),
    change: metal.change24h,
    changePercent: metal.changePercent24h,
    changeFormatted: formatPrice(metal.change24h, "USD"),
  };
}
