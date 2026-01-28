'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBrechaColor, getBrechaClass } from '@/lib/utils';
import { Brecha } from '@/types';

interface BrechaGaugeProps {
  brecha: Brecha;
}

export function BrechaGauge({ brecha }: BrechaGaugeProps) {
  const color = getBrechaColor(brecha.nivel);
  const animationClass = getBrechaClass(brecha.nivel);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Semaforo de Brecha
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Semaforo visual */}
          <div className="relative mb-4">
            <div
              className={`w-20 h-20 rounded-full ${animationClass}`}
              style={{ backgroundColor: color }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {brecha.porcentajeBrecha.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-lg font-semibold" style={{ color }}>
              {brecha.nivel === 'BAJA' && 'Brecha Baja'}
              {brecha.nivel === 'MEDIA' && 'Brecha Media'}
              {brecha.nivel === 'ALTA' && 'Brecha Alta'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {brecha.descripcion}
            </p>
          </div>

          {/* Detalles */}
          <div className="w-full mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Oficial</span>
              <span>${brecha.dolarOficial.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Blue</span>
              <span>${brecha.dolarBlue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
