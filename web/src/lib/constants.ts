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
