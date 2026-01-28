'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Cotizacion } from '@/types';

interface DolarCardProps {
  cotizacion: Cotizacion;
}

export function DolarCard({ cotizacion }: DolarCardProps) {
  const variacion = cotizacion.variacion || 0;
  const isPositive = variacion > 0;
  const isNegative = variacion < 0;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {cotizacion.nombre}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(cotizacion.venta)}</p>
            <p className="text-xs text-muted-foreground">
              Compra: {formatCurrency(cotizacion.compra)}
            </p>
          </div>
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
            <span>{variacion.toFixed(2)}%</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Spread: {formatCurrency(cotizacion.spread)}
        </div>
      </CardContent>
    </Card>
  );
}
