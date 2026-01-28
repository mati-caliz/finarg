'use client';

import { useCotizaciones, useBrecha } from '@/hooks/useCotizaciones';
import { useReservas } from '@/hooks/useReservas';
import { useArbitraje } from '@/hooks/useArbitraje';
import { useInflacionActual } from '@/hooks/useInflacion';
import { DolarCard } from '@/components/dashboard/DolarCard';
import { BrechaGauge } from '@/components/dashboard/BrechaGauge';
import { ReservasWidget } from '@/components/dashboard/ReservasWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: cotizaciones, isLoading: loadingCotizaciones } = useCotizaciones();
  const { data: brecha, isLoading: loadingBrecha } = useBrecha();
  const { data: reservas, isLoading: loadingReservas } = useReservas();
  const { data: arbitraje } = useArbitraje();
  const { data: inflacion } = useInflacionActual();

  const oportunidadesViables = arbitraje?.filter((a) => a.viable) || [];

  if (loadingCotizaciones || loadingBrecha || loadingReservas) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen del mercado financiero argentino
        </p>
      </div>

      {/* Alertas de Arbitraje */}
      {oportunidadesViables.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-4 w-4" />
              Oportunidades de Arbitraje Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {oportunidadesViables.slice(0, 3).map((op, i) => (
                <Link
                  key={i}
                  href="/arbitraje"
                  className="text-sm bg-yellow-500/20 px-3 py-1 rounded-full hover:bg-yellow-500/30 transition-colors"
                >
                  {op.descripcion} ({op.spreadPorcentaje.toFixed(2)}%)
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Cotizaciones principales */}
        {cotizaciones?.slice(0, 4).map((cotizacion) => (
          <DolarCard key={cotizacion.tipo} cotizacion={cotizacion} />
        ))}
      </div>

      {/* Segunda fila */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Semaforo de Brecha */}
        {brecha && <BrechaGauge brecha={brecha} />}

        {/* Reservas BCRA */}
        {reservas && <ReservasWidget reservas={reservas} />}

        {/* Inflacion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inflacion Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-red-500">
                  {inflacion?.valor?.toFixed(1) || '0'}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ultimo mes disponible
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500/50" />
            </div>
            <Link
              href="/inflacion"
              className="text-sm text-primary hover:underline mt-4 inline-block"
            >
              Ver historico y ajustar valores
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Cotizaciones adicionales */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Otras Cotizaciones</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cotizaciones?.slice(4).map((cotizacion) => (
            <DolarCard key={cotizacion.tipo} cotizacion={cotizacion} />
          ))}
        </div>
      </div>

      {/* Links rapidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/ganancias">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-medium">Calculadora de Ganancias</p>
              <p className="text-sm text-muted-foreground">
                Calcula tu impuesto a las ganancias
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/simulador">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-medium">Simulador de Inversiones</p>
              <p className="text-sm text-muted-foreground">
                Compara rendimientos
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inflacion">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-medium">Ajuste por Inflacion</p>
              <p className="text-sm text-muted-foreground">
                Actualiza valores historicos
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cauciones">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-medium">Optimizador de Cauciones</p>
              <p className="text-sm text-muted-foreground">
                Maximiza tus rendimientos
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
