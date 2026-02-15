"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { formatReservesUSD } from "@/lib/utils";
import type { Reserves } from "@/types";

const LIABILITY_COLORS = ["#ef4444", "#3b82f6", "#eab308", "#8b5cf6", "#06b6d4"];

interface ReservesCompositionChartProps {
  reserves: Reserves;
}

export function ReservesCompositionChart({ reserves }: ReservesCompositionChartProps) {
  const { translate } = useTranslation();

  if (reserves.grossReserves <= 0 || (reserves.liabilitiesBCRA?.length ?? 0) === 0) {
    return null;
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">{translate("reservesComposition")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative h-8 rounded-lg overflow-hidden bg-muted">
            <div
              className="absolute h-full bg-green-500"
              style={{
                width: `${
                  ((reserves.netReservesBCRA ?? reserves.netReserves) / reserves.grossReserves) *
                  100
                }%`,
              }}
            />
            {
              reserves?.liabilitiesBCRA?.reduce<{
                total: number;
                elements: JSX.Element[];
              }>(
                (acc, liability, i) => {
                  const net = reserves.netReservesBCRA ?? reserves.netReserves;
                  const left = ((net + acc.total) / reserves.grossReserves) * 100;
                  const width = (liability.amount / reserves.grossReserves) * 100;
                  acc.elements.push(
                    <div
                      key={liability.id}
                      className="absolute h-full"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: LIABILITY_COLORS[i % LIABILITY_COLORS.length],
                      }}
                    />,
                  );
                  acc.total += liability.amount;
                  return acc;
                },
                { total: 0, elements: [] },
              ).elements
            }
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">{translate("netReservesBCRA")}</p>
                <p className="text-sm text-foreground">
                  {formatReservesUSD(reserves.netReservesBCRA ?? reserves.netReserves)}
                </p>
              </div>
            </div>
            {reserves?.liabilitiesBCRA?.map((liability, index) => (
              <div key={liability.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{
                    backgroundColor: LIABILITY_COLORS[index % LIABILITY_COLORS.length],
                  }}
                />
                <div>
                  <p className="text-xs text-muted-foreground">{liability.name}</p>
                  <p className="text-sm text-foreground">{formatReservesUSD(liability.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
