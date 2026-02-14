import { type CountryCode, getCountryConfig } from "@/config/countries";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencySimple(value: number, country: CountryCode = "ar"): string {
  const config = getCountryConfig(country);
  return `${config.currencySymbol} ${formatNumber(value, 2)}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatReservesUSD(value: number): string {
  return `${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value))} M USD`;
}

export function getGapColor(level: string): string {
  switch (level) {
    case "LOW":
    case "BAJA":
      return "hsl(152 75% 25%)";
    case "MEDIUM":
    case "MEDIA":
      return "hsl(38 92% 28%)";
    case "HIGH":
    case "ALTA":
      return "hsl(0 75% 38%)";
    default:
      return "#6b7280";
  }
}

export function getGapClass(level: string): string {
  switch (level) {
    case "LOW":
    case "BAJA":
      return "text-green-500 animate-pulse-green";
    case "MEDIUM":
    case "MEDIA":
      return "text-yellow-500 animate-pulse-yellow";
    case "HIGH":
    case "ALTA":
      return "text-red-500 animate-pulse-red";
    default:
      return "text-gray-500";
  }
}

function quoteVariantOrder(type: string): number {
  if (type === "oficial" || type.endsWith("_oficial")) {
    return 0;
  }
  if (type === "blue" || type.endsWith("_blue")) {
    return 1;
  }
  if (type === "tarjeta" || type.endsWith("_tarjeta")) {
    return 2;
  }
  return 3;
}

export function sortQuotesByVariant<T extends { type: string }>(quotes: T[]): T[] {
  return [...quotes].sort((a, b) => quoteVariantOrder(a.type) - quoteVariantOrder(b.type));
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatCurrency(value: number | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(0);
  }
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
}

export function formatPercent(value: number | string, decimals = 2): string {
  return `${Number(value).toFixed(decimals)}%`;
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
}

export function formatDateDayShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export function formatDateSlash(dateStr: string | undefined): string | null {
  if (!dateStr) {
    return null;
  }
  const [y, m, d] = dateStr.split("-");
  return d && m && y ? `${d}/${m}/${y}` : dateStr;
}

export function formatLimit(limit: number | undefined): string | null {
  if (limit === undefined || limit === null || limit <= 0) {
    return null;
  }
  if (limit >= 1_000_000) {
    return `$${(limit / 1_000_000).toFixed(0)} M`;
  }
  if (limit >= 1_000) {
    return `$${(limit / 1_000).toFixed(0)} K`;
  }
  return `$${limit}`;
}

interface ChartDataWithDate {
  fecha: string;
  fechaOriginal: string;
  [key: string]: string | number;
}

interface Government {
  startDate: string;
  endDate: string;
  label: string;
  color: string;
}

interface ReferenceArea {
  x1: string | number;
  x2: string | number;
  fill: string;
  label: string;
}

export function generateReferenceAreas(
  chartData: ChartDataWithDate[],
  governments: Government[],
  useIndex = false,
): ReferenceArea[] {
  if (!chartData || chartData.length === 0) {
    return [];
  }

  const firstDataDate = new Date(chartData[0]?.fechaOriginal || "");
  const lastDataDate = new Date(chartData[chartData.length - 1]?.fechaOriginal || "");

  return governments
    .filter((gov) => {
      const govStart = new Date(gov.startDate);
      const govEnd = new Date(gov.endDate);
      return govStart <= lastDataDate && govEnd >= firstDataDate;
    })
    .map((gov) => {
      const govStart = new Date(gov.startDate);
      const govEnd = new Date(gov.endDate);

      let x1: string | number = useIndex ? 0 : chartData[0]?.fechaOriginal || chartData[0]?.fecha;
      let x2: string | number = useIndex
        ? chartData.length - 1
        : chartData[chartData.length - 1]?.fechaOriginal || chartData[chartData.length - 1]?.fecha;

      for (let i = 0; i < chartData.length; i++) {
        const date = new Date(chartData[i].fechaOriginal);
        if (date >= govStart) {
          x1 = useIndex ? i : chartData[i].fechaOriginal || chartData[i].fecha;
          break;
        }
      }

      for (let i = chartData.length - 1; i >= 0; i--) {
        const date = new Date(chartData[i].fechaOriginal);
        if (date <= govEnd) {
          x2 = useIndex ? i : chartData[i].fechaOriginal || chartData[i].fecha;
          break;
        }
      }

      return {
        x1,
        x2,
        fill: gov.color,
        label: gov.label,
      };
    });
}
