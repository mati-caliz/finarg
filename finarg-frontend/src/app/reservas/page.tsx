'use client';

import { useQuery } from '@tanstack/react-query';
import { reservasApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, LineChart } from '@/components/charts';
import { Reservas } from '@/types';
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

const PERIODOS = [
  { value: 7, label: '7 días' },
  { value: 30, label: '30 días' },
  { value: 90, label: '3 meses' },
  { value: 180, label: '6 meses' },
];

export default function ReservasPage() {
  const [periodo, setPeriodo] = useState(30);

  const {
    data: reservasActuales,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['reservas'],
    queryFn: async () => {
      const response = await reservasApi.getActuales();
      return response.data as Reservas;
    },
    refetchInterval: 300000, // Refrescar cada 5 minutos
  });

  const { data: historicoReservas, isLoading: historicoLoading } = useQuery({
    queryKey: ['reservas-historico', periodo],
    queryFn: async () => {
      const response = await reservasApi.getHistorico(periodo);
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

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia?.toUpperCase()) {
      case 'SUBIENDO':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'BAJANDO':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia?.toUpperCase()) {
      case 'SUBIENDO':
        return 'text-green-500';
      case 'BAJANDO':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reservas del BCRA</h1>
          <p className="text-gray-400 text-sm mt-1">
            Reservas internacionales del Banco Central de la República Argentina
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* KPIs principales */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-800 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Reservas Brutas</p>
                <Landmark className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-white">
                {reservasActuales ? formatUSD(reservasActuales.reservasBrutas) : '-'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {reservasActuales && getTendenciaIcon(reservasActuales.tendencia)}
                <span
                  className={`text-sm ${
                    reservasActuales ? getTendenciaColor(reservasActuales.tendencia) : ''
                  }`}
                >
                  {reservasActuales?.variacionDiaria
                    ? `${reservasActuales.variacionDiaria >= 0 ? '+' : ''}${formatUSD(
                        reservasActuales.variacionDiaria
                      )}`
                    : '-'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Reservas Netas (Est.)</p>
                <Building2 className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">
                {reservasActuales ? formatUSD(reservasActuales.reservasNetas) : '-'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Estimación sin swaps ni encajes</p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Swap con China</p>
                <Globe className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {reservasActuales ? formatUSD(reservasActuales.swapChina) : '-'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Se descuenta de netas</p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Encajes Bancarios</p>
                <Banknote className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {reservasActuales ? formatUSD(reservasActuales.encajesBancarios) : '-'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Depósitos en USD del público</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Desglose de reservas */}
      {reservasActuales && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Composición de las Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Barra de composición */}
              <div className="relative h-8 rounded-lg overflow-hidden bg-gray-800">
                <div
                  className="absolute h-full bg-green-500"
                  style={{
                    width: `${
                      (reservasActuales.reservasNetas / reservasActuales.reservasBrutas) * 100
                    }%`,
                  }}
                />
                <div
                  className="absolute h-full bg-red-500"
                  style={{
                    left: `${
                      (reservasActuales.reservasNetas / reservasActuales.reservasBrutas) * 100
                    }%`,
                    width: `${
                      (reservasActuales.swapChina / reservasActuales.reservasBrutas) * 100
                    }%`,
                  }}
                />
                <div
                  className="absolute h-full bg-yellow-500"
                  style={{
                    left: `${
                      ((reservasActuales.reservasNetas + reservasActuales.swapChina) /
                        reservasActuales.reservasBrutas) *
                      100
                    }%`,
                    width: `${
                      (reservasActuales.encajesBancarios / reservasActuales.reservasBrutas) * 100
                    }%`,
                  }}
                />
              </div>

              {/* Leyenda */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <div>
                    <p className="text-xs text-gray-400">Reservas Netas</p>
                    <p className="text-sm text-white">
                      {formatFullUSD(reservasActuales.reservasNetas)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <div>
                    <p className="text-xs text-gray-400">Swap China</p>
                    <p className="text-sm text-white">
                      {formatFullUSD(reservasActuales.swapChina)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-400">Encajes</p>
                    <p className="text-sm text-white">
                      {formatFullUSD(reservasActuales.encajesBancarios)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <div>
                    <p className="text-xs text-gray-400">Dep. Gobierno</p>
                    <p className="text-sm text-white">
                      {formatFullUSD(reservasActuales.depositosGobierno)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico histórico */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Evolución Histórica</CardTitle>
            <div className="flex flex-wrap gap-2">
              {PERIODOS.map((p) => (
                <Button
                  key={p.value}
                  variant={periodo === p.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriodo(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historicoLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : historicoReservas && historicoReservas.length > 0 ? (
            <AreaChart
              data={historicoReservas.map((r: any) => ({
                fecha: formatDate(r.fecha),
                reservasBrutas: r.reservasBrutas,
              }))}
              xKey="fecha"
              yKey="reservasBrutas"
              color="#10b981"
              height={300}
              formatY={(v) => formatUSD(v)}
              gradientId="reservasGradient"
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No hay datos históricos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Building2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-500 font-medium mb-1">Sobre las Reservas Netas</p>
              <p className="text-gray-400">
                Las reservas netas son una estimación que descuenta de las reservas brutas: el swap
                con China, los encajes bancarios (depósitos del público en dólares), y los
                depósitos del gobierno nacional. El cálculo exacto es complejo ya que depende de
                datos que el BCRA no publica diariamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
