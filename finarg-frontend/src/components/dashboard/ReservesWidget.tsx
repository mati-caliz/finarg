'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
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
            <p className="text-xs text-muted-foreground">Gross</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">
                USD {formatNumber(reserves.grossReserves, 0)} M
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
                <span>{variation > 0 ? '+' : ''}{formatNumber(variation, 0)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">Net (estimated)</p>
            <p className="text-xl font-semibold text-yellow-500">
              USD {formatNumber(reserves.netReserves, 0)} M
            </p>
          </div>

          <div className="pt-2 border-t border-border text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>China Swap</span>
              <span>-{formatNumber(reserves.chinaSwap, 0)} M</span>
            </div>
            <div className="flex justify-between">
              <span>Bank Reserves</span>
              <span>-{formatNumber(reserves.bankDeposits ?? reserves.bankReserves ?? 0, 0)} M</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { ReservesWidget as ReservasWidget };
export type { ReservesWidgetProps as ReservasWidgetProps };
