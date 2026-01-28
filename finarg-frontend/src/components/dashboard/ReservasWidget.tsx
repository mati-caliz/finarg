'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { Reservas } from '@/types';

interface ReservasWidgetProps {
  reservas: Reservas;
}

export function ReservasWidget({ reservas }: ReservasWidgetProps) {
  const variacion = reservas.variacionDiaria || 0;
  const isPositive = variacion > 0;
  const isNegative = variacion < 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Reservas BCRA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Reservas Brutas */}
          <div>
            <p className="text-xs text-muted-foreground">Brutas</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">
                USD {formatNumber(reservas.reservasBrutas, 0)} M
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
                <span>{variacion > 0 ? '+' : ''}{formatNumber(variacion, 0)}</span>
              </div>
            </div>
          </div>

          {/* Reservas Netas */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">Netas (estimadas)</p>
            <p className="text-xl font-semibold text-yellow-500">
              USD {formatNumber(reservas.reservasNetas, 0)} M
            </p>
          </div>

          {/* Componentes */}
          <div className="pt-2 border-t border-border text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Swap China</span>
              <span>-{formatNumber(reservas.swapChina, 0)} M</span>
            </div>
            <div className="flex justify-between">
              <span>Encajes</span>
              <span>-{formatNumber(reservas.encajesBancarios, 0)} M</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
