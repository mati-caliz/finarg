export const VARIATION_COLOR_POSITIVE = "text-emerald-600 dark:text-emerald-400";
export const VARIATION_COLOR_NEGATIVE = "text-red-600 dark:text-red-400";

export function variationColor(isPositive: boolean): string {
  return isPositive ? VARIATION_COLOR_POSITIVE : VARIATION_COLOR_NEGATIVE;
}

interface RiskStyles {
  text: string;
  border: string;
  hoverBorder: string;
  bg: string;
}

const RISK_LEVELS: { threshold: number; styles: RiskStyles }[] = [
  {
    threshold: 500,
    styles: {
      text: "text-success-accessible",
      border: "border-t-emerald-500",
      hoverBorder: "hover:border-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-500/15",
    },
  },
  {
    threshold: 800,
    styles: {
      text: "text-warning-accessible",
      border: "border-t-yellow-500",
      hoverBorder: "hover:border-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-500/15",
    },
  },
  {
    threshold: 1200,
    styles: {
      text: "text-orange-600",
      border: "border-t-orange-500",
      hoverBorder: "hover:border-orange-400",
      bg: "bg-orange-100 dark:bg-orange-500/15",
    },
  },
];

const RISK_EXTREME: RiskStyles = {
  text: "text-destructive-accessible",
  border: "border-t-red-500",
  hoverBorder: "hover:border-red-400",
  bg: "bg-red-100 dark:bg-red-500/15",
};

export function getRiskStyles(value: number): RiskStyles {
  for (const level of RISK_LEVELS) {
    if (value < level.threshold) {
      return level.styles;
    }
  }
  return RISK_EXTREME;
}

export const CACHE_TIMES = {
  REALTIME_STALE: 5 * 60 * 1000,
  REALTIME_GC: 60 * 60 * 1000,
  MARKET_STALE: 30 * 60 * 1000,
  MARKET_GC: 24 * 60 * 60 * 1000,
  HISTORICAL_STALE: 60 * 60 * 1000,
  HISTORICAL_GC: 7 * 24 * 60 * 60 * 1000,
  STATIC_STALE: 24 * 60 * 60 * 1000,
  STATIC_GC: 7 * 24 * 60 * 60 * 1000,
  NEWS_STALE: 10 * 60 * 1000,
  NEWS_GC: 60 * 60 * 1000,
  QUOTES_STALE: 5 * 60 * 1000,
  QUOTES_GC: 24 * 60 * 60 * 1000,
} as const;

export const CHART_STYLES = {
  grid: { stroke: "hsl(var(--border))" },
  axis: {
    stroke: "hsl(var(--muted-foreground))",
    fill: "hsl(var(--muted-foreground))",
    fontSize: 12,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px",
    },
    labelStyle: { color: "hsl(var(--foreground))" },
    itemStyle: { color: "hsl(var(--foreground))" },
  },
} as const;

export const INVESTMENT_GRID = {
  FOUR_COL: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
  THREE_COL: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
} as const;

export const BANDS_COLOR_CLASSES = {
  green: {
    bg: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-t-emerald-400",
    hoverBorder: "hover:border-t-emerald-300",
    indicator: "bg-emerald-500",
  },
  yellow: {
    bg: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-t-amber-400",
    hoverBorder: "hover:border-t-amber-300",
    indicator: "bg-amber-500",
  },
  red: {
    bg: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    border: "border-t-red-400",
    hoverBorder: "hover:border-t-red-300",
    indicator: "bg-red-500",
  },
} as const;
