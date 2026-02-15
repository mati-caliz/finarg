"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { CompoundInterestResponse } from "@/types";
import { TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

const LineChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.LineChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  },
);

interface CompoundInterestResultsProps {
  result: CompoundInterestResponse;
  initialCapital: number;
}

export function CompoundInterestResults({ result, initialCapital }: CompoundInterestResultsProps) {
  const { translate } = useTranslation();

  return (
    <>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">{translate("calculationResult")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-lg bg-green-500/20 border border-green-500/30">
              <span className="font-medium text-foreground">{translate("finalAmount")}</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(result.finalAmount)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  {translate("totalContributions")}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(result.totalContributions)}
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">{translate("totalInterest")}</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(result.totalInterest)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">{translate("interestEarnings")}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-green-500 h-full transition-all duration-500"
                    style={{
                      width: `${(result.totalInterest / result.finalAmount) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-primary">
                  {((result.totalInterest / result.finalAmount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {result.periods.length > 0 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              {translate("growthEvolution")}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Monto total acumulado (capital + aportes + intereses) mes a mes
            </p>
          </CardHeader>
          <CardContent>
            <LineChart
              data={result.periods.map((p) => ({
                mes: `Mes ${p.period}`,
                total: p.total,
              }))}
              xKey="mes"
              yKey="total"
              colors={["#10b981"]}
              height={300}
              formatY={(v) => formatCurrency(Number(v))}
              formatX={(v) => {
                const match = v.toString().match(/Mes (\d+)/);
                if (!match) {
                  return "";
                }
                const month = Number(match[1]);

                const totalMonths = result.periods[result.periods.length - 1].period;

                if (month === 1) {
                  return "1";
                }
                if (totalMonths <= 24) {
                  if (month % 6 === 0) {
                    return `${month}`;
                  }
                } else if (totalMonths <= 60) {
                  if (month % 12 === 0) {
                    return `${month}`;
                  }
                } else {
                  if (month % 24 === 0) {
                    return `${month}`;
                  }
                }
                if (month === totalMonths) {
                  return `${month}`;
                }
                return "";
              }}
              showGrid={false}
            />

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground">{translate("months")}</th>
                    <th className="text-right py-2 text-muted-foreground">
                      {translate("contributions")}
                    </th>
                    <th className="text-right py-2 text-muted-foreground">
                      {translate("interest")}
                    </th>
                    <th className="text-right py-2 text-muted-foreground">{translate("total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.periods.map((period) => (
                    <tr key={period.period} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{period.period}</td>
                      <td className="text-right py-2 text-muted-foreground">
                        {formatCurrency(period.principal + initialCapital)}
                      </td>
                      <td className="text-right py-2 text-primary">
                        {formatCurrency(period.interest)}
                      </td>
                      <td className="text-right py-2 text-foreground font-medium">
                        {formatCurrency(period.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
