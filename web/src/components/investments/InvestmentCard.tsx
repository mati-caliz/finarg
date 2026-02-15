"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { variationColor } from "@/lib/constants";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

export interface InvestmentCardProps {
  borderColor: string;
  title: string;
  subtitle?: string;
  primaryValue: string;
  change?: number | null;
  changePercent?: number | null;
  changeFormatted?: string;
  currency?: string;
  icon?: ReactNode;
  secondaryInfo?: Array<{ label: string; value: string }>;
  footer?: ReactNode;
}

export function InvestmentCard({
  borderColor,
  title,
  subtitle,
  primaryValue,
  change,
  changePercent,
  changeFormatted,
  icon,
  secondaryInfo,
  footer,
}: InvestmentCardProps) {
  const hasChange = change !== undefined && change !== null;
  const isPositive = (change ?? 0) >= 0;

  return (
    <Card className={`border-t-[3px] ${borderColor}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{title}</span>
          {icon !== undefined ? (
            icon
          ) : hasChange ? (
            <span className={variationColor(isPositive)}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          <p className="text-2xl font-bold">{primaryValue}</p>

          {(changeFormatted !== undefined || changePercent !== undefined) && (
            <div className="flex items-center justify-between text-xs">
              {changeFormatted !== undefined && (
                <span className={variationColor(isPositive)}>{changeFormatted}</span>
              )}
              {changePercent !== undefined && changePercent !== null && (
                <span className={variationColor(isPositive)}>{changePercent.toFixed(2)}%</span>
              )}
            </div>
          )}

          {secondaryInfo && secondaryInfo.length > 0 && (
            <div className="pt-2 border-t grid grid-cols-2 gap-2">
              {secondaryInfo.map((info) => (
                <div key={info.label}>
                  <p className="text-xs text-muted-foreground">{info.label}</p>
                  <p className="text-sm font-medium">{info.value}</p>
                </div>
              ))}
            </div>
          )}

          {footer && <div className="pt-2 border-t">{footer}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
