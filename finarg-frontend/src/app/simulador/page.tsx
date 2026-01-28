'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { simuladorApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart } from '@/components/charts';
import { SimulacionRequest, SimulacionResponse } from '@/types';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
  Loader2,
  PiggyBank,
  Building,
  Coins,
  Bitcoin,
} from 'lucide-react';

const TIPOS_INVERSION = [
  { value: 'PLAZO_FIJO', label: 'Plazo Fijo', icon: Building, color: 'text-blue-500' },
  { value: 'PLAZO_FIJO_UVA', label: 'Plazo Fijo UVA', icon: TrendingUp, color: 'text-green-500' },
  { value: 'FCI_MONEY_MARKET', label: 'FCI Money Market', icon: PiggyBank, color: 'text-purple-500' },
  { value: 'CAUCION_BURSATIL', label: 'Caución Bursátil', icon: Coins, color: 'text-yellow-500' },
  { value: 'STABLECOIN', label: 'Stablecoin DeFi', icon: Bitcoin, color: 'text-orange-500' },
];

const PLAZOS = [
  { value: 30, label: '30 días' },
  { value: 60, label: '60 días' },
  { value: 90, label: '90 días' },
  { value: 180, label: '180 días' },
  { value: 365, label: '1 año' },
];

export default function SimuladorPage() {
  const [formData, setFormData] = useState<SimulacionRequest>({
    montoInicial: 1000000,
    tipoInversion: 'PLAZO_FIJO',
    plazoDias: 30,
    reinvertir: true,
  });

  const [resultado, setResultado] = useState<SimulacionResponse | null>(null);

  const { data: tasas } = useQuery({
    queryKey: ['tasas'],
    queryFn: async () => {
      const response = await simuladorApi.getTasas();
      return response.data;
    },
  });

  const simularMutation = useMutation({
    mutationFn: async (data: SimulacionRequest) => {
      const response = await simuladorApi.simular(data);
      return response.data as SimulacionResponse;
    },
    onSuccess: (data) => {
      setResultado(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simularMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof SimulacionRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  const formatUSD = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Simulador de Inversiones</h1>
        <p className="text-gray-400 text-sm mt-1">
          Compara rendimientos de diferentes instrumentos financieros
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <Card className="bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Configurar Simulación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Monto inicial */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monto a Invertir
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={formData.montoInicial || ''}
                    onChange={(e) =>
                      handleInputChange('montoInicial', parseFloat(e.target.value) || 0)
                    }
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(formData.montoInicial)}
                </p>
              </div>

              {/* Tipo de inversión */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Inversión
                </label>
                <div className="space-y-2">
                  {TIPOS_INVERSION.map((tipo) => {
                    const Icon = tipo.icon;
                    return (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => handleInputChange('tipoInversion', tipo.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          formData.tipoInversion === tipo.value
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${tipo.color}`} />
                        <span className="text-sm text-white">{tipo.label}</span>
                      </button>
                    );
                  })}
                </div>
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
                      variant={formData.plazoDias === plazo.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleInputChange('plazoDias', plazo.value)}
                    >
                      {plazo.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reinvertir */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="reinvertir"
                  checked={formData.reinvertir}
                  onChange={(e) => handleInputChange('reinvertir', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary"
                />
                <label htmlFor="reinvertir" className="text-sm text-gray-300">
                  Reinvertir intereses (interés compuesto)
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={simularMutation.isPending || formData.montoInicial <= 0}
              >
                {simularMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Simulando...
                  </>
                ) : (
                  'Simular Inversión'
                )}
              </Button>
            </form>
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
                    <p className="text-xs text-gray-400">Ganancia ARS</p>
                    <p className="text-xl font-bold text-green-500 mt-1">
                      +{formatCurrency(resultado.gananciaARS)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">Rendimiento Nominal</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      {formatPercent(resultado.rendimientoNominal)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">Rendimiento Real</p>
                    <p
                      className={`text-xl font-bold mt-1 ${
                        resultado.rendimientoReal >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {resultado.rendimientoReal >= 0 ? '+' : ''}
                      {formatPercent(resultado.rendimientoReal)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detalles y tasas */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Detalles de la Simulación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">TNA</p>
                      <p className="text-lg font-semibold text-white">
                        {formatPercent(resultado.tasaTNA)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">TEA</p>
                      <p className="text-lg font-semibold text-white">
                        {formatPercent(resultado.tasaTEA)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">Ganancia USD (estimada)</p>
                      <p className="text-lg font-semibold text-green-500">
                        {formatUSD(resultado.gananciaUSD)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">Rendimiento en USD</p>
                      <p
                        className={`text-lg font-semibold ${
                          resultado.rendimientoEnDolares >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {resultado.rendimientoEnDolares >= 0 ? '+' : ''}
                        {formatPercent(resultado.rendimientoEnDolares)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de proyección */}
              {resultado.proyeccion && resultado.proyeccion.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Proyección de Capital</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={resultado.proyeccion.map((p) => ({
                        mes: `Mes ${p.mes}`,
                        capital: p.capitalAcumulado,
                        rendimientoReal: p.rendimientoReal,
                      }))}
                      xKey="mes"
                      yKey={['capital']}
                      colors={['#10b981']}
                      height={250}
                      formatY={(v) => `$${(v / 1000000).toFixed(2)}M`}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Tabla de proyección mensual */}
              {resultado.proyeccion && resultado.proyeccion.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Proyección Mensual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-2 text-gray-400">Mes</th>
                            <th className="text-right py-2 text-gray-400">Capital</th>
                            <th className="text-right py-2 text-gray-400">Intereses</th>
                            <th className="text-right py-2 text-gray-400">Inflación Est.</th>
                            <th className="text-right py-2 text-gray-400">Rend. Real</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.proyeccion.map((mes) => (
                            <tr key={mes.mes} className="border-b border-gray-800/50">
                              <td className="py-2 text-white">{mes.mes}</td>
                              <td className="text-right py-2 text-white">
                                {formatCurrency(mes.capitalAcumulado)}
                              </td>
                              <td className="text-right py-2 text-green-500">
                                +{formatCurrency(mes.interesesMes)}
                              </td>
                              <td className="text-right py-2 text-yellow-500">
                                {formatPercent(mes.inflacionEstimada)}
                              </td>
                              <td
                                className={`text-right py-2 ${
                                  mes.rendimientoReal >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}
                              >
                                {mes.rendimientoReal >= 0 ? '+' : ''}
                                {formatPercent(mes.rendimientoReal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-card h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <TrendingUp className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">
                  Configura los parámetros y simula tu inversión
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Compara plazos fijos, FCI, stablecoins y más
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
