'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { inflacionApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, LineChart } from '@/components/charts';
import { Inflacion, AjusteInflacion } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Calculator,
  Loader2,
  BarChart3,
} from 'lucide-react';

export default function InflacionPage() {
  const [montoOriginal, setMontoOriginal] = useState<number>(100000);
  const [fechaOrigen, setFechaOrigen] = useState<string>('2023-01-01');
  const [fechaDestino, setFechaDestino] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [ajusteResultado, setAjusteResultado] = useState<AjusteInflacion | null>(null);

  const { data: inflacionActual } = useQuery({
    queryKey: ['inflacion-actual'],
    queryFn: async () => {
      const response = await inflacionApi.getActual();
      return response.data as Inflacion;
    },
  });

  const { data: inflacionMensual } = useQuery({
    queryKey: ['inflacion-mensual'],
    queryFn: async () => {
      const response = await inflacionApi.getMensual(24);
      return response.data as Inflacion[];
    },
  });

  const { data: inflacionInteranual } = useQuery({
    queryKey: ['inflacion-interanual'],
    queryFn: async () => {
      const response = await inflacionApi.getInteranual();
      return response.data;
    },
  });

  const ajustarMutation = useMutation({
    mutationFn: async () => {
      const response = await inflacionApi.ajustar(montoOriginal, fechaOrigen, fechaDestino);
      return response.data as AjusteInflacion;
    },
    onSuccess: (data) => {
      setAjusteResultado(data);
    },
  });

  const handleAjustar = (e: React.FormEvent) => {
    e.preventDefault();
    ajustarMutation.mutate();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Inflación Argentina</h1>
        <p className="text-gray-400 text-sm mt-1">
          Datos del IPC y calculadora de ajuste por inflación
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Inflación Mensual</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {inflacionActual ? formatPercent(inflacionActual.valor) : '-'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {inflacionActual?.fecha
                    ? new Date(inflacionActual.fecha).toLocaleDateString('es-AR', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Inflación Interanual</p>
                <p className="text-2xl font-bold text-red-500 mt-1">
                  {inflacionActual?.interanual ? formatPercent(inflacionActual.interanual) : '-'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Últimos 12 meses</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Acumulado del Año</p>
                <p className="text-2xl font-bold text-yellow-500 mt-1">
                  {inflacionActual?.acumuladoAnio
                    ? formatPercent(inflacionActual.acumuladoAnio)
                    : '-'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Desde enero {new Date().getFullYear()}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculadora de ajuste */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Calculadora de Ajuste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAjustar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monto Original
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="100000"
                    value={montoOriginal || ''}
                    onChange={(e) => setMontoOriginal(parseFloat(e.target.value) || 0)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Origen</label>
                <Input
                  type="date"
                  value={fechaOrigen}
                  onChange={(e) => setFechaOrigen(e.target.value)}
                  max={fechaDestino}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha Destino
                </label>
                <Input
                  type="date"
                  value={fechaDestino}
                  onChange={(e) => setFechaDestino(e.target.value)}
                  min={fechaOrigen}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={ajustarMutation.isPending || montoOriginal <= 0}
              >
                {ajustarMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  'Calcular Ajuste'
                )}
              </Button>
            </form>

            {/* Resultado del ajuste */}
            {ajusteResultado && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Monto Original</span>
                    <span className="text-white">{formatCurrency(ajusteResultado.montoOriginal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Meses Transcurridos</span>
                    <span className="text-white">{ajusteResultado.mesesTranscurridos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Inflación Acumulada</span>
                    <span className="text-red-500">
                      +{formatPercent(ajusteResultado.inflacionAcumulada)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Monto Ajustado</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(ajusteResultado.montoAjustado)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Para mantener el mismo poder adquisitivo
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico de inflación mensual */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Evolución Mensual (últimos 24 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              {inflacionMensual && inflacionMensual.length > 0 ? (
                <BarChart
                  data={inflacionMensual.map((i) => ({
                    fecha: formatDate(i.fecha),
                    valor: i.valor,
                  }))}
                  xKey="fecha"
                  yKey="valor"
                  color="#10b981"
                  height={250}
                  formatY={(v) => `${v.toFixed(1)}%`}
                />
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500">
                  Cargando datos...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabla de datos mensuales */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Datos Mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 text-gray-400">Período</th>
                      <th className="text-right py-2 text-gray-400">Mensual</th>
                      <th className="text-right py-2 text-gray-400">Interanual</th>
                      <th className="text-right py-2 text-gray-400">Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inflacionMensual?.map((inflacion, index) => (
                      <tr key={index} className="border-b border-gray-800/50">
                        <td className="py-2 text-white">
                          {new Date(inflacion.fecha).toLocaleDateString('es-AR', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="text-right py-2 text-white">
                          {formatPercent(inflacion.valor)}
                        </td>
                        <td className="text-right py-2 text-red-500">
                          {inflacion.interanual ? formatPercent(inflacion.interanual) : '-'}
                        </td>
                        <td className="text-right py-2 text-yellow-500">
                          {inflacion.acumuladoAnio ? formatPercent(inflacion.acumuladoAnio) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
