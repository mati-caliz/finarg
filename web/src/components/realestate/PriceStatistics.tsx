import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PriceStatistics as PriceStatisticsType } from "@/types";
import { BarChart3, Home, TrendingDown, TrendingUp } from "lucide-react";

interface PriceStatisticsProps {
  statistics: PriceStatisticsType;
  currency: string;
}

export function PriceStatistics({ statistics, currency }: PriceStatisticsProps) {
  const formatCurrency = (value: number) => {
    return `${currency} ${value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const stats = [
    {
      id: "average",
      label: "Promedio por m²",
      value: formatCurrency(statistics.averagePricePerM2),
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      id: "median",
      label: "Mediana por m²",
      value: formatCurrency(statistics.medianPricePerM2),
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      id: "min",
      label: "Mínimo por m²",
      value: formatCurrency(statistics.minPricePerM2),
      icon: TrendingDown,
      color: "text-amber-600",
    },
    {
      id: "max",
      label: "Máximo por m²",
      value: formatCurrency(statistics.maxPricePerM2),
      icon: TrendingUp,
      color: "text-violet-600",
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-t-[3px] border-t-emerald-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Estadísticas de Precios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.id} className="space-y-1">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span>{stat.label}</span>
                </div>
                <div className="text-lg font-semibold">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
            <span>{statistics.propertiesCount} propiedades analizadas</span>
            <span>
              {statistics.totalSurfaceM2Analyzed.toLocaleString("es-AR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{" "}
              m² totales
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
