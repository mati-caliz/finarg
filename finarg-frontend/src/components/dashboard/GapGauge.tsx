'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getGapColor, getGapClass } from '@/lib/utils';
import { Gap } from '@/types';

interface GapGaugeProps {
  gap: Gap;
}

export function GapGauge({ gap }: GapGaugeProps) {
  const color = getGapColor(gap.level);
  const animationClass = getGapClass(gap.level);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Gap Indicator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div
              className={`w-20 h-20 rounded-full ${animationClass}`}
              style={{ backgroundColor: color }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {gap.gapPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold" style={{ color }}>
              {gap.level === 'LOW' && 'Low Gap'}
              {gap.level === 'MEDIUM' && 'Medium Gap'}
              {gap.level === 'HIGH' && 'High Gap'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {gap.description}
            </p>
          </div>

          <div className="w-full mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Official</span>
              <span>${gap.officialRate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Parallel</span>
              <span>${gap.parallelRate.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { GapGauge as BrechaGauge };
export type { GapGaugeProps as BrechaGaugeProps };
