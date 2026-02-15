"use client";

import InstallmentCalculatorForm from "@/components/calculators/installments/InstallmentCalculatorForm";
import type { InstallmentCalculatorFormHandle } from "@/components/calculators/installments/InstallmentCalculatorForm";
import InstallmentResultCard from "@/components/calculators/installments/InstallmentResultCard";
import SavedCalculationsCard from "@/components/calculators/installments/SavedCalculationsCard";
import { formatCurrency } from "@/components/calculators/installments/formatCurrency";
import type {
  CalculationResult,
  ChartDataPoint,
  InflationComparison,
  SavedCalculation,
} from "@/components/calculators/installments/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentInflation } from "@/hooks/useInflation";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DynamicLineChart = dynamic(
  () =>
    Promise.resolve(({ data }: { data: ChartDataPoint[] }) => (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="month"
            className="text-xs"
            label={{ value: "Cuota N°", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            className="text-xs"
            label={{ value: "Valor ($)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="nominalValue"
            stroke="#94a3b8"
            name="Valor nominal"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="presentValue"
            stroke="#10b981"
            name="Valor presente"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    )),
  { ssr: false },
);

export default function InstallmentsVsCashCalculatorPage() {
  const { data: inflation, isLoading: loadingInflation } = useCurrentInflation();

  const formRef = useRef<InstallmentCalculatorFormHandle>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [calculationName, setCalculationName] = useState("");
  const [inflationComparisons, setInflationComparisons] = useState<InflationComparison[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("savedInstallmentCalculations");
    if (saved) {
      setSavedCalculations(JSON.parse(saved));
    }
  }, []);

  const handleCalculate = useCallback(
    (calculationResult: CalculationResult, comparisons: InflationComparison[]) => {
      setResult(calculationResult);
      setInflationComparisons(comparisons);
    },
    [],
  );

  const handleSaveCalculation = () => {
    if (result === null || !calculationName.trim()) return;

    const newCalculation: SavedCalculation = {
      id: Date.now().toString(),
      name: calculationName.trim(),
      cashPrice: result.cashPrice,
      installmentValue: result.installmentValue,
      numberOfInstallments: result.numberOfInstallments,
      monthlyInflation: result.monthlyInflation,
      savedAt: new Date().toISOString(),
    };

    const updated = [...savedCalculations, newCalculation];
    setSavedCalculations(updated);
    localStorage.setItem("savedInstallmentCalculations", JSON.stringify(updated));
    setShowSaveDialog(false);
    setCalculationName("");
  };

  const handleLoadCalculation = (calc: SavedCalculation) => {
    const total = calc.installmentValue * calc.numberOfInstallments;
    formRef.current?.loadValues(
      calc.cashPrice.toString(),
      total.toString(),
      calc.numberOfInstallments.toString(),
      calc.monthlyInflation.toString(),
    );
  };

  const handleDeleteCalculation = (id: string) => {
    const updated = savedCalculations.filter((c) => c.id !== id);
    setSavedCalculations(updated);
    localStorage.setItem("savedInstallmentCalculations", JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">¿Cuotas o Contado?</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Calculá si te conviene pagar en cuotas o de contado considerando la inflación
        </p>
      </div>

      <SavedCalculationsCard
        calculations={savedCalculations}
        onLoad={handleLoadCalculation}
        onDelete={handleDeleteCalculation}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <InstallmentCalculatorForm
          ref={formRef}
          onCalculate={handleCalculate}
          onSave={() => setShowSaveDialog(true)}
          hasResult={result !== null}
          inflation={inflation}
          loadingInflation={loadingInflation}
        />

        <InstallmentResultCard result={result} />
      </div>

      {result !== null && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Evolución del valor de las cuotas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Este gráfico muestra cómo el valor real de cada cuota disminuye con el tiempo debido
                a la inflación.
              </p>
              <DynamicLineChart data={result.chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparación con diferentes tasas de inflación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                ¿Qué pasaría si la inflación fuera diferente? Esta tabla muestra cómo cambia la
                recomendación.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Inflación mensual</th>
                      <th className="text-right p-2">Valor presente</th>
                      <th className="text-right p-2">Ahorro/Costo</th>
                      <th className="text-center p-2">Recomendación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inflationComparisons.map((comp) => (
                      <tr key={comp.inflationRate} className="border-b hover:bg-muted/50">
                        <td className="p-2">{comp.inflationRate.toFixed(1)}%</td>
                        <td className="text-right p-2">{formatCurrency(comp.presentValue)}</td>
                        <td
                          className={`text-right p-2 font-medium ${
                            comp.savings > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {comp.savings > 0 ? "+" : ""}
                          {formatCurrency(comp.savings)}
                        </td>
                        <td className="text-center p-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              comp.recommendation === "installments"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {comp.recommendation === "installments" ? "Cuotas" : "Contado"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Guardar cálculo</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowSaveDialog(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calculationName">Nombre del cálculo</Label>
                <Input
                  id="calculationName"
                  placeholder="Ej: Notebook HP"
                  value={calculationName}
                  onChange={(e) => setCalculationName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveCalculation()}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveCalculation}
                  className="flex-1"
                  disabled={!calculationName.trim()}
                >
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
