'use client';

import { useQuery } from '@tanstack/react-query';
import { reservesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart } from '@/components/charts';
import { Reserves } from '@/types';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Landmark,
  Banknote,
  Globe,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function ReservesPage() {
  const { translate } = useTranslation();
  const [period, setPeriod] = useState(30);

  const PERIODS = [
    { value: 7, label: translate('days7') },
    { value: 30, label: translate('days30') },
    { value: 90, label: translate('months3') },
    { value: 180, label: translate('months6') },
  ];

  const {
    data: currentReserves,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['reserves'],
    queryFn: async () => {
      const response = await reservesApi.getCurrent();
      return response.data as Reserves;
    },
    refetchInterval: 300000,
  });

  const { data: historicalReserves, isLoading: historicalLoading } = useQuery({
    queryKey: ['reserves-historical', period],
    queryFn: async () => {
      const response = await reservesApi.getHistory(period);
      return response.data;
    },
  });

  const formatUSD = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);

  const formatFullUSD = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend?.toUpperCase()) {
      case 'RISING':
      case 'SUBIENDO':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'FALLING':
      case 'BAJANDO':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend?.toUpperCase()) {
      case 'RISING':
      case 'SUBIENDO':
        return 'text-green-500';
      case 'FALLING':
      case 'BAJANDO':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translate('bcraReservesTitle')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {translate('bcraReservesDesc')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {translate('refresh')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{translate('grossReserves')}</p>
                <Landmark className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {currentReserves ? formatUSD(currentReserves.grossReserves) : '-'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {currentReserves && getTrendIcon(currentReserves.trend)}
                <span
                  className={`text-sm ${
                    currentReserves ? getTrendColor(currentReserves.trend) : ''
                  }`}
                >
                  {currentReserves && currentReserves.dailyVariation !== null
                    ? `${currentReserves.dailyVariation >= 0 ? '+' : ''}${formatUSD(
                        currentReserves.dailyVariation
                      )}`
                    : '-'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{translate('netReservesEst')}</p>
                <Building2 className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">
                {currentReserves ? formatUSD(currentReserves.netReserves) : '-'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{translate('estWithoutSwaps')}</p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{translate('chinaSwap')}</p>
                <Globe className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {currentReserves ? formatUSD(currentReserves.chinaSwap) : '-'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{translate('subtractedFromNet')}</p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{translate('bankReserves')}</p>
                <Banknote className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {currentReserves ? formatUSD(currentReserves.bankDeposits ?? currentReserves.bankReserves ?? 0) : '-'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{translate('publicUsdDeposits')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {currentReserves && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">{translate('reservesComposition')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative h-8 rounded-lg overflow-hidden bg-muted">
                <div
                  className="absolute h-full bg-green-500"
                  style={{
                    width: `${
                      (currentReserves.netReserves / currentReserves.grossReserves) * 100
                    }%`,
                  }}
                />
                <div
                  className="absolute h-full bg-red-500"
                  style={{
                    left: `${
                      (currentReserves.netReserves / currentReserves.grossReserves) * 100
                    }%`,
                    width: `${
                      (currentReserves.chinaSwap / currentReserves.grossReserves) * 100
                    }%`,
                  }}
                />
                <div
                  className="absolute h-full bg-yellow-500"
                  style={{
                    left: `${
                      ((currentReserves.netReserves + currentReserves.chinaSwap) /
                        currentReserves.grossReserves) *
                      100
                    }%`,
                    width: `${
                      (((currentReserves.bankDeposits ?? currentReserves.bankReserves) ?? 0) / currentReserves.grossReserves) * 100
                    }%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">{translate('netReservesEst')}</p>
                    <p className="text-sm text-foreground">
                      {formatFullUSD(currentReserves.netReserves)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">{translate('chinaSwap')}</p>
                    <p className="text-sm text-foreground">
                      {formatFullUSD(currentReserves.chinaSwap)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">{translate('bankReserves')}</p>
                    <p className="text-sm text-foreground">
                      {formatFullUSD(currentReserves.bankDeposits ?? currentReserves.bankReserves ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">{translate('govDeposits')}</p>
                    <p className="text-sm text-foreground">
                      {formatFullUSD(currentReserves.governmentDeposits)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">{translate('historicalEvolution')}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <Button
                  key={p.value}
                  variant={period === p.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historicalLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : historicalReserves && historicalReserves.length > 0 ? (
            <AreaChart
              data={historicalReserves.map((r: { fecha: string; reservasBrutas: number }) => ({
                fecha: formatDate(r.fecha),
                reservasBrutas: r.reservasBrutas,
              }))}
              xKey="fecha"
              yKey="reservasBrutas"
              color="#10b981"
              height={300}
              formatY={(v) => formatUSD(Number(v))}
              gradientId="reservesGradient"
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {translate('noHistoricalData')}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Building2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-500 font-medium mb-1">{translate('aboutNetReserves')}</p>
              <p className="text-muted-foreground">
                {translate('netReservesInfo')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
