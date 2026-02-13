import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface VariationBadgeProps {
  variation: number;
  format?: "percentage" | "absolute";
  decimals?: number;
  showSign?: boolean;
  className?: string;
}

export function VariationBadge({
  variation,
  format = "percentage",
  decimals = 2,
  showSign = false,
  className,
}: VariationBadgeProps) {
  const isPositive = variation > 0;
  const isNegative = variation < 0;

  const formattedValue =
    format === "percentage"
      ? `${variation.toFixed(decimals)}%`
      : `${showSign && variation > 0 ? "+" : ""}${variation.toLocaleString("es-AR", {
          maximumFractionDigits: decimals,
        })}`;

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm px-2 py-1 rounded-full",
        isPositive
          ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15"
          : isNegative
            ? "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/15"
            : "text-muted-foreground bg-muted",
        className,
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : isNegative ? (
        <TrendingDown className="h-3.5 w-3.5" />
      ) : (
        <Minus className="h-3.5 w-3.5" />
      )}
      <span className="text-xs font-medium">{formattedValue}</span>
    </div>
  );
}
