'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cotizacionesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart } from '@/components/charts';
import { Cotizacion } from '@/types';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { QueryError } from '@/components/QueryError';
import {
  DolarCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const TIPOS_DOLAR = [
  { value: 'BLUE', label: 'Blue' },
  { value: 'OFICIAL', label: 'Oficial' },
  { value: 'MEP', label: 'MEP' },
  { value: 'CCL', label: 'CCL' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'MAYORISTA', label: 'Mayorista' },
  { value: 'CRYPTO', label: 'Crypto' },
];

const PERIODOS = [
  { value: '7', label: '7 días' },
  { value: '30', label: '30 días' },
  { value: '90', label: '3 meses' },
  { value: '180', label: '6 meses' },
  { value: '365', label: '1 año' },
];

export default function CotizacionesPage() {
  const [selectedTipo, setSelectedTipo] = useState('BLUE');
  const [periodo, setPeriodo] = useState('30');

  const {
    data: cotizaciones,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cotizaciones'],
    queryFn: async () => {
      const response = await cotizacionesApi.getAll();
      return response.data as Cotizacion[];
    },
    refetchInterval: 60000, // Refrescar cada minuto
  });

  const {
    data: historico,
    isLoading: historicoLoading,
    isError: historicoError,
    error: historicoErrorData,
    refetch: refetchHistorico,
  } = useQuery({
    queryKey: ['historico', selectedTipo, periodo],
    queryFn: async () => {
      const hasta = new Date().toISOString().split('T')[0];
      const desde = new Date(Date.now() - parseInt(periodo) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const response = await cotizacionesApi.getHistorico(selectedTipo, desde, hasta);
      return response.data;
    },
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  // Error state for main cotizaciones
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Cotizaciones del Dólar</h1>
          <p className="text-gray-400 text-sm mt-1">
            Todas las cotizaciones en tiempo real
          </p>
        </div>
        <QueryError
          error={error as Error}
          onRetry={() => refetch()}
          title="Error al cargar cotizaciones"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Cotizaciones del Dólar</h1>
          <p className="text-gray-400 text-sm mt-1">
            Todas las cotizaciones en tiempo real
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

      {/* Cards de cotizaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => <DolarCardSkeleton key={i} />)
        ) : (
          cotizaciones?.map((cotizacion) => (
            <Card
              key={cotizacion.tipo}
              className={`bg-card cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                selectedTipo === cotizacion.tipo ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTipo(cotizacion.tipo)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-400">{cotizacion.nombre}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Spread: {cotizacion.spread.toFixed(2)}%
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      cotizacion.variacion >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {cotizacion.variacion >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(cotizacion.variacion).toFixed(2)}%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Compra</p>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(cotizacion.compra)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Venta</p>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(cotizacion.venta)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  {new Date(cotizacion.fechaActualizacion).toLocaleString('es-AR')}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Gráfico histórico */}
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">
              Histórico - Dólar {TIPOS_DOLAR.find((t) => t.value === selectedTipo)?.label}
            </CardTitle>
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
              <Skeleton className="w-full h-full" />
            </div>
          ) : historicoError ? (
            <QueryError
              error={historicoErrorData as Error}
              onRetry={() => refetchHistorico()}
              compact
            />
          ) : historico && historico.length > 0 ? (
            <LineChart
              data={historico}
              xKey="fecha"
              yKey={['compra', 'venta']}
              colors={['#3b82f6', '#10b981']}
              height={300}
              formatX={formatDate}
              formatY={(v) => `$${v.toLocaleString('es-AR')}`}
              showLegend
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No hay datos históricos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla comparativa */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Comparativa de Cotizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Tipo</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Compra</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Venta</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Spread</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Variación</th>
                  </tr>
                </thead>
                <tbody>
                  {cotizaciones?.map((cotizacion) => (
                    <tr
                      key={cotizacion.tipo}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-white">{cotizacion.nombre}</span>
                      </td>
                      <td className="text-right py-3 px-4 text-white">
                        {formatCurrency(cotizacion.compra)}
                      </td>
                      <td className="text-right py-3 px-4 text-white">
                        {formatCurrency(cotizacion.venta)}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-400">
                        {cotizacion.spread.toFixed(2)}%
                      </td>
                      <td
                        className={`text-right py-3 px-4 ${
                          cotizacion.variacion >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {cotizacion.variacion >= 0 ? '+' : ''}
                        {cotizacion.variacion.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
