'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { gananciasApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart } from '@/components/charts';
import { GananciasRequest, GananciasResponse } from '@/types';
import { Calculator, DollarSign, Users, Home, GraduationCap, Loader2 } from 'lucide-react';

export default function GananciasPage() {
  const [formData, setFormData] = useState<GananciasRequest>({
    sueldoBrutoMensual: 0,
    tipoEmpleado: 'RELACION_DEPENDENCIA',
    tieneConyuge: false,
    cantidadHijos: 0,
    obraSocial: undefined,
    jubilacion: undefined,
    sindicato: undefined,
    alquilerVivienda: undefined,
    servicioDomestico: undefined,
    gastosEducativos: undefined,
  });

  const [resultado, setResultado] = useState<GananciasResponse | null>(null);

  const calcularMutation = useMutation({
    mutationFn: async (data: GananciasRequest) => {
      const response = await gananciasApi.calcular(data);
      return response.data as GananciasResponse;
    },
    onSuccess: (data) => {
      setResultado(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calcularMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof GananciasRequest, value: GananciasRequest[keyof GananciasRequest]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Calculadora de Impuesto a las Ganancias</h1>
        <p className="text-gray-400 text-sm mt-1">
          Calcula tu impuesto con los tramos actualizados 2025
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Datos del Empleado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos básicos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sueldo Bruto Mensual
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.sueldoBrutoMensual || ''}
                      onChange={(e) =>
                        handleInputChange('sueldoBrutoMensual', parseFloat(e.target.value) || 0)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Empleado
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={
                        formData.tipoEmpleado === 'RELACION_DEPENDENCIA' ? 'default' : 'outline'
                      }
                      onClick={() => handleInputChange('tipoEmpleado', 'RELACION_DEPENDENCIA')}
                      className="w-full"
                    >
                      Rel. Dependencia
                    </Button>
                    <Button
                      type="button"
                      variant={formData.tipoEmpleado === 'AUTONOMO' ? 'default' : 'outline'}
                      onClick={() => handleInputChange('tipoEmpleado', 'AUTONOMO')}
                      className="w-full"
                    >
                      Autónomo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cargas de familia */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Users className="h-4 w-4" />
                  Cargas de Familia
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Cónyuge</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={formData.tieneConyuge ? 'default' : 'outline'}
                        onClick={() => handleInputChange('tieneConyuge', true)}
                      >
                        Sí
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!formData.tieneConyuge ? 'default' : 'outline'}
                        onClick={() => handleInputChange('tieneConyuge', false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Cantidad de Hijos</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.cantidadHijos}
                      onChange={(e) =>
                        handleInputChange('cantidadHijos', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Deducciones opcionales */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Home className="h-4 w-4" />
                  Deducciones Opcionales
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Alquiler Vivienda</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.alquilerVivienda || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'alquilerVivienda',
                          parseFloat(e.target.value) || undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Servicio Doméstico</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.servicioDomestico || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'servicioDomestico',
                          parseFloat(e.target.value) || undefined
                        )
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <GraduationCap className="h-3 w-3" />
                    Gastos Educativos
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.gastosEducativos || ''}
                    onChange={(e) =>
                      handleInputChange('gastosEducativos', parseFloat(e.target.value) || undefined)
                    }
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={calcularMutation.isPending || formData.sueldoBrutoMensual <= 0}
              >
                {calcularMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  'Calcular Impuesto'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="space-y-6">
          {resultado ? (
            <>
              {/* Resumen principal */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Resultado del Cálculo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">Sueldo Bruto Anual</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(resultado.sueldoBrutoAnual)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">Total Deducciones</p>
                      <p className="text-xl font-bold text-green-500">
                        {formatCurrency(resultado.totalDeducciones)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">Ganancia Neta Sujeta</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(resultado.gananciaNetaSujetaAImpuesto)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-900/30 rounded-lg border border-red-800">
                      <p className="text-xs text-gray-400">Impuesto Anual</p>
                      <p className="text-xl font-bold text-red-500">
                        {formatCurrency(resultado.impuestoAnual)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">Impuesto Mensual</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(resultado.impuestoMensual)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Alícuota Efectiva</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatPercent(resultado.alicuotaEfectiva)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400">Sueldo Neto Mensual (después de impuesto)</p>
                      <p className="text-xl font-bold text-green-500">
                        {formatCurrency(resultado.sueldoNetoMensual)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detalle de deducciones */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Detalle de Deducciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Mínimo No Imponible</span>
                      <span className="text-white">
                        {formatCurrency(resultado.detalleCalculo.minimoNoImponible)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Deducción Especial</span>
                      <span className="text-white">
                        {formatCurrency(resultado.detalleCalculo.deduccionEspecial)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Cargas de Familia</span>
                      <span className="text-white">
                        {formatCurrency(resultado.detalleCalculo.cargasFamilia)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Deducciones Personales</span>
                      <span className="text-white">
                        {formatCurrency(resultado.detalleCalculo.deduccionesPersonales)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 font-bold">
                      <span className="text-white">Total Deducciones Permitidas</span>
                      <span className="text-green-500">
                        {formatCurrency(resultado.detalleCalculo.totalDeduccionesPermitidas)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de tramos */}
              {resultado.desglosePorTramo && resultado.desglosePorTramo.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Desglose por Tramos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={resultado.desglosePorTramo.map((t) => ({
                        tramo: `Tramo ${t.tramo}`,
                        impuesto: t.impuestoTramo,
                        alicuota: t.alicuota,
                      }))}
                      xKey="tramo"
                      yKey="impuesto"
                      color="#ef4444"
                      height={200}
                      formatY={(v) => formatCurrency(v)}
                    />
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-2 text-gray-400">Tramo</th>
                            <th className="text-right py-2 text-gray-400">Desde</th>
                            <th className="text-right py-2 text-gray-400">Hasta</th>
                            <th className="text-right py-2 text-gray-400">Alícuota</th>
                            <th className="text-right py-2 text-gray-400">Base Imp.</th>
                            <th className="text-right py-2 text-gray-400">Impuesto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.desglosePorTramo.map((tramo) => (
                            <tr key={tramo.tramo} className="border-b border-gray-800/50">
                              <td className="py-2 text-white">{tramo.tramo}</td>
                              <td className="text-right py-2 text-gray-400">
                                {formatCurrency(tramo.desde)}
                              </td>
                              <td className="text-right py-2 text-gray-400">
                                {formatCurrency(tramo.hasta)}
                              </td>
                              <td className="text-right py-2 text-primary">{tramo.alicuota}%</td>
                              <td className="text-right py-2 text-white">
                                {formatCurrency(tramo.baseImponible)}
                              </td>
                              <td className="text-right py-2 text-red-500">
                                {formatCurrency(tramo.impuestoTramo)}
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
                <Calculator className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">
                  Completa el formulario para ver el resultado del cálculo
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
