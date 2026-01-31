'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatReservesUSD } from '@/lib/utils';
import { Reserves } from '@/types';

interface ReservesWidgetProps {
  reserves: Reserves;
  label?: string;
}

export function ReservesWidget({ reserves, label = 'BCRA Reserves' }: ReservesWidgetProps) {
  const variation = reserves.dailyVariation || 0;
  const isPositive = variation > 0;
  const isNegative = variation < 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Gross (millones USD)</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">
                {formatReservesUSD(reserves.grossReserves)}
              </p>
              <div
                className={`flex items-center gap-1 text-sm ${
                  isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : isNegative ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                <span>{variation > 0 ? '+' : ''}{variation.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            {reserves.netReservesBCRA !== undefined && reserves.netReservesBCRA !== null && (
              <div>
                <p className="text-xs text-muted-foreground">Net (BCRA)</p>
                <p className="text-lg font-semibold text-green-500">
                  {formatReservesUSD(reserves.netReservesBCRA)}
                </p>
              </div>
            )}
            {reserves.netReservesFMI !== undefined && reserves.netReservesFMI !== null && (
              <div>
                <p className="text-xs text-muted-foreground">Net (FMI)</p>
                <p
                  className={`text-lg font-semibold ${
                    reserves.netReservesFMI < 0 ? 'text-red-500' : 'text-amber-600'
                  }`}
                >
                  {reserves.netReservesFMI < 0 ? '−' : ''}
                  {formatReservesUSD(Math.abs(reserves.netReservesFMI))}
                </p>
              </div>
            )}
            {(reserves.netReservesBCRA === undefined || reserves.netReservesBCRA === null) &&
              (reserves.netReservesFMI === undefined || reserves.netReservesFMI === null) && (
              <div>
                <p className="text-xs text-muted-foreground">Net (estimated)</p>
                <p className="text-lg font-semibold text-green-500">
                  {formatReservesUSD(reserves.netReserves)}
                </p>
              </div>
            )}
          </div>

          {reserves.liabilities && reserves.liabilities.length > 0 && (
            <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
              {reserves.liabilities.map((liability) => (
                <div key={liability.id} className="flex justify-between">
                  <span>{liability.name}</span>
                  <span>-{formatReservesUSD(liability.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
