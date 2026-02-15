"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPercent } from "@/lib/utils";
import type { Inflation } from "@/types";

interface InflationDataTableProps {
  monthlyInflation: Inflation[];
}

export function InflationDataTable({ monthlyInflation }: InflationDataTableProps) {
  const { translate } = useTranslation();

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">{translate("monthlyData")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[300px] pr-2">
          <div className="pr-4">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">
                    {translate("period")}
                  </th>
                  <th className="text-right py-2 text-muted-foreground font-medium">
                    {translate("monthlyInflation")}
                  </th>
                  <th className="text-right py-2 text-muted-foreground font-medium">
                    {translate("yearOverYear")}
                  </th>
                  <th className="text-right py-2 text-muted-foreground font-medium pr-2">
                    {translate("yearToDate")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyInflation?.map((inflation) => (
                  <tr key={inflation.date} className="border-b border-border/50">
                    <td className="py-2 text-foreground">
                      {new Date(inflation.date).toLocaleDateString("es-AR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-right py-2 text-foreground">
                      {formatPercent(inflation.value)}
                    </td>
                    <td className="text-right py-2 text-red-500">
                      {typeof inflation.yearOverYear === "number"
                        ? formatPercent(inflation.yearOverYear)
                        : "-"}
                    </td>
                    <td className="text-right py-2 text-yellow-500 pr-2">
                      {typeof inflation.yearToDate === "number"
                        ? formatPercent(inflation.yearToDate)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
