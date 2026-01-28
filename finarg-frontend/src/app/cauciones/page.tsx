'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { caucionesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart } from '@/components/charts';
import {
  Coins,
  DollarSign,
  Calendar,
  Calculator,
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface CaucionResult {
  montoInicial: number;
  plazoDias: number;
  tasaTNA: number;
  tasaTEA: number;
  rendimientoTotal: number;
  montoFinal: number;
  gananciaARS: number;
  comisionEstimada: number;
  rendimientoNeto: number;
  estrategiaOptima: string;
  comparativa: {
    plazo: number;
    tasaTNA: number;
    montoFinal: number;
    rendimiento: number;
  }[];
  recomendaciones: string[];
}

const PLAZOS = [
  { value: 1, label: '1 día' },
  { value: 7, label: '7 días' },
  { value: 14, label: '14 días' },
  { value: 30, label: '30 días' },
  { value: 60, label: '60 días' },
];

export default function CaucionesPage() {
  const [monto, setMonto] = useState<number>(1000000);
  const [plazoDias, setPlazoDias] = useState<number>(7);
  const [resultado, setResultado] = useState<CaucionResult | null>(null);

  const optimizarMutation = useMutation({
    mutationFn: async () => {
      const response = await caucionesApi.optimizar(monto, plazoDias);
      return response.data as CaucionResult;
    },
    onSuccess: (data) => {
      setResultado(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    optimizarMutation.mutate();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Optimizador de Cauciones</h1>
        <p className="text-gray-400 text-sm mt-1">
          Encuentra la mejor estrategia de caución bursátil para tu capital
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <Card className="bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-primary" />
              Configurar Caución
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monto a Colocar
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={monto || ''}
                    onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(monto)}</p>
              </div>

              {/* Plazo */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  Plazo
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLAZOS.map((plazo) => (
                    <Button
                      key={plazo.value}
                      type="button"
                      variant={plazoDias === plazo.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPlazoDias(plazo.value)}
                    >
                      {plazo.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={optimizarMutation.isPending || monto <= 0}
              >
                {optimizarMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizando...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Optimizar Caución
                  </>
                )}
              </Button>
            </form>

            {/* Info sobre cauciones */}
            <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">¿Qué es una caución?</h4>
              <p className="text-xs text-gray-400">
                Una caución bursátil es un préstamo de corto plazo donde tu dinero está garantizado
                por títulos valores. Es una opción de renta fija con liquidez diaria y tasas
                competitivas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="lg:col-span-2 space-y-6">
          {resultado ? (
            <>
              {/* KPIs principales */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">Monto Final</p>
                    <p className="text-xl font-bold text-white mt-1">
                      {formatCurrency(resultado.montoFinal)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">Ganancia Bruta</p>
                    <p className="text-xl font-bold text-green-500 mt-1">
                      +{formatCurrency(resultado.gananciaARS)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">TNA</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      {formatPercent(resultado.tasaTNA)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">TEA</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      {formatPercent(resultado.tasaTEA)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detalle */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Detalle de la Operación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Monto Inicial</span>
                        <span className="text-white">{formatCurrency(resultado.montoInicial)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Plazo</span>
                        <span className="text-white">{resultado.plazoDias} días</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Rendimiento Total</span>
                        <span className="text-green-500">
                          +{formatPercent(resultado.rendimientoTotal)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Comisión Est.</span>
                        <span className="text-red-500">
                          -{formatCurrency(resultado.comisionEstimada)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Rend. Neto</span>
                        <span className="text-green-500">
                          {formatPercent(resultado.rendimientoNeto)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-white font-medium">Monto Final</span>
                        <span className="text-primary font-bold">
                          {formatCurrency(resultado.montoFinal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estrategia óptima */}
                  {resultado.estrategiaOptima && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-primary">Estrategia Óptima</p>
                          <p className="text-sm text-gray-300 mt-1">{resultado.estrategiaOptima}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comparativa de plazos */}
              {resultado.comparativa && resultado.comparativa.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Comparativa por Plazo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={resultado.comparativa.map((c) => ({
                        plazo: `${c.plazo}d`,
                        tasaTNA: c.tasaTNA,
                        rendimiento: c.rendimiento,
                      }))}
                      xKey="plazo"
                      yKey={['tasaTNA']}
                      colors={['#10b981']}
                      height={200}
                      formatY={(v) => `${v.toFixed(1)}%`}
                    />

                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-2 text-gray-400">Plazo</th>
                            <th className="text-right py-2 text-gray-400">TNA</th>
                            <th className="text-right py-2 text-gray-400">Monto Final</th>
                            <th className="text-right py-2 text-gray-400">Rendimiento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.comparativa.map((comp) => (
                            <tr
                              key={comp.plazo}
                              className={`border-b border-gray-800/50 ${
                                comp.plazo === resultado.plazoDias ? 'bg-primary/5' : ''
                              }`}
                            >
                              <td className="py-2 text-white">
                                {comp.plazo} días
                                {comp.plazo === resultado.plazoDias && (
                                  <span className="ml-2 text-xs text-primary">(seleccionado)</span>
                                )}
                              </td>
                              <td className="text-right py-2 text-primary">
                                {formatPercent(comp.tasaTNA)}
                              </td>
                              <td className="text-right py-2 text-white">
                                {formatCurrency(comp.montoFinal)}
                              </td>
                              <td className="text-right py-2 text-green-500">
                                +{formatPercent(comp.rendimiento)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recomendaciones */}
              {resultado.recomendaciones && resultado.recomendaciones.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Recomendaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {resultado.recomendaciones.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-primary mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-card h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <Coins className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">Configura los parámetros para optimizar tu caución</p>
                <p className="text-gray-600 text-sm mt-2">
                  Compara tasas y plazos para maximizar tu rendimiento
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-500 font-medium mb-1">Información importante</p>
              <p className="text-gray-400">
                Las tasas de caución son indicativas y pueden variar según las condiciones del
                mercado y tu broker. Las comisiones estimadas son aproximadas y dependen del
                intermediario. Siempre verificá las condiciones antes de operar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
