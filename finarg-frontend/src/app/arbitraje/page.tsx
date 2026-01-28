'use client';

import { useQuery } from '@tanstack/react-query';
import { arbitrajeApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Arbitraje } from '@/types';
import {
  ArrowRightLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign,
} from 'lucide-react';

const getRiesgoColor = (riesgo: string) => {
  switch (riesgo?.toUpperCase()) {
    case 'BAJO':
      return 'text-green-500 bg-green-500/10';
    case 'MEDIO':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'ALTO':
      return 'text-red-500 bg-red-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
  }
};

export default function ArbitrajePage() {
  const {
    data: oportunidades,
    isLoading,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['arbitraje'],
    queryFn: async () => {
      const response = await arbitrajeApi.getOportunidades();
      return response.data as Arbitraje[];
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const viables = oportunidades?.filter((o) => o.viable) || [];
  const noViables = oportunidades?.filter((o) => !o.viable) || [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  const formatUSD = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Detector de Arbitraje</h1>
          <p className="text-gray-400 text-sm mt-1">
            Oportunidades de ganancia entre diferentes cotizaciones del dólar
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-500">
            Actualizado:{' '}
            {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('es-AR') : '-'}
          </p>
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
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ArrowRightLeft className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Oportunidades</p>
              <p className="text-2xl font-bold text-white">{oportunidades?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Viables</p>
              <p className="text-2xl font-bold text-green-500">{viables.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">No Viables</p>
              <p className="text-2xl font-bold text-red-500">{noViables.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          {/* Oportunidades viables */}
          {viables.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Oportunidades Viables
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {viables.map((oportunidad, index) => (
                  <Card key={index} className="bg-card border-green-500/20">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="text-gray-400">{oportunidad.tipoOrigen}</span>
                          <ArrowRightLeft className="h-4 w-4 text-primary" />
                          <span className="text-white">{oportunidad.tipoDestino}</span>
                        </CardTitle>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getRiesgoColor(
                            oportunidad.riesgo
                          )}`}
                        >
                          Riesgo {oportunidad.riesgo}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Cotizaciones */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-400">Compra ({oportunidad.tipoOrigen})</p>
                            <p className="text-lg font-semibold text-white">
                              {formatCurrency(oportunidad.cotizacionOrigen)}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-400">Venta ({oportunidad.tipoDestino})</p>
                            <p className="text-lg font-semibold text-white">
                              {formatCurrency(oportunidad.cotizacionDestino)}
                            </p>
                          </div>
                        </div>

                        {/* Spread y ganancia */}
                        <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div>
                            <p className="text-xs text-gray-400">Spread</p>
                            <p className="text-xl font-bold text-green-500">
                              +{oportunidad.spreadPorcentaje.toFixed(2)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Ganancia por USD 1.000</p>
                            <p className="text-xl font-bold text-green-500">
                              {formatCurrency(oportunidad.gananciaEstimadaPor1000USD)}
                            </p>
                          </div>
                        </div>

                        {/* Descripción */}
                        <p className="text-sm text-gray-400">{oportunidad.descripcion}</p>

                        {/* Pasos */}
                        {oportunidad.pasos && (
                          <div className="p-3 bg-gray-800/30 rounded-lg">
                            <p className="text-xs text-gray-500 mb-2">Pasos para ejecutar:</p>
                            <p className="text-sm text-gray-300">{oportunidad.pasos}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Oportunidades no viables */}
          {noViables.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <XCircle className="h-5 w-5 text-gray-500" />
                Monitoreo (No Viables Actualmente)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {noViables.map((oportunidad, index) => (
                  <Card key={index} className="bg-card opacity-60">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">{oportunidad.tipoOrigen}</span>
                          <ArrowRightLeft className="h-3 w-3 text-gray-600" />
                          <span className="text-gray-400">{oportunidad.tipoDestino}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${getRiesgoColor(
                            oportunidad.riesgo
                          )}`}
                        >
                          {oportunidad.riesgo}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Spread</p>
                          <p
                            className={`text-lg font-semibold ${
                              oportunidad.spreadPorcentaje >= 0 ? 'text-gray-400' : 'text-red-500'
                            }`}
                          >
                            {oportunidad.spreadPorcentaje >= 0 ? '+' : ''}
                            {oportunidad.spreadPorcentaje.toFixed(2)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Ganancia USD 1k</p>
                          <p className="text-lg font-semibold text-gray-400">
                            {formatCurrency(oportunidad.gananciaEstimadaPor1000USD)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sin oportunidades */}
          {oportunidades?.length === 0 && (
            <Card className="bg-card">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No hay oportunidades de arbitraje
                </h3>
                <p className="text-gray-400 text-sm">
                  Las cotizaciones están equilibradas. Volveremos a verificar en 30 segundos.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Disclaimer */}
      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-500 font-medium mb-1">Disclaimer</p>
              <p className="text-gray-400">
                Las oportunidades de arbitraje son estimaciones basadas en cotizaciones públicas.
                Los spreads reales pueden variar debido a comisiones, tiempos de transferencia y
                disponibilidad de moneda. Siempre verificar las condiciones antes de operar.
                Esta información no constituye asesoramiento financiero.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
