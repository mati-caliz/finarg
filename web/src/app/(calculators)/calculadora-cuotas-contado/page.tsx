"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentInflation } from "@/hooks/useInflation";
import { BookmarkPlus, Calculator, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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

interface CalculationResult {
  cashPrice: number;
  installmentPrice: number;
  numberOfInstallments: number;
  installmentValue: number;
  monthlyInflation: number;
  presentValue: number;
  savings: number;
  savingsPercent: number;
  recommendation: "cash" | "installments";
  chartData: ChartDataPoint[];
}

interface ChartDataPoint {
  month: number;
  nominalValue: number;
  presentValue: number;
}

interface SavedCalculation {
  id: string;
  name: string;
  cashPrice: number;
  installmentValue: number;
  numberOfInstallments: number;
  monthlyInflation: number;
  savedAt: string;
}

interface InflationComparison {
  inflationRate: number;
  presentValue: number;
  savings: number;
  savingsPercent: number;
  recommendation: "cash" | "installments";
}

export default function InstallmentsVsCashCalculatorPage() {
  const { data: inflation, isLoading: loadingInflation } = useCurrentInflation();

  const [cashPrice, setCashPrice] = useState<string>("");
  const [totalInstallmentPrice, setTotalInstallmentPrice] = useState<string>("");
  const [numberOfInstallments, setNumberOfInstallments] = useState<string>("12");
  const [customInflation, setCustomInflation] = useState<string>("");
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

  const calculatePresentValueWithData = (
    installmentValue: number,
    numberOfInstallments: number,
    monthlyInflation: number,
  ): { presentValue: number; chartData: ChartDataPoint[] } => {
    let presentValue = 0;
    const chartData: ChartDataPoint[] = [];

    for (let i = 1; i <= numberOfInstallments; i++) {
      const pv = installmentValue / (1 + monthlyInflation / 100) ** i;
      presentValue += pv;
      chartData.push({
        month: i,
        nominalValue: installmentValue,
        presentValue: pv,
      });
    }

    return { presentValue, chartData };
  };

  const calculateForInflationRate = (
    cashPrice: number,
    installmentValue: number,
    numberOfInstallments: number,
    inflationRate: number,
  ): InflationComparison => {
    const { presentValue } = calculatePresentValueWithData(
      installmentValue,
      numberOfInstallments,
      inflationRate,
    );
    const savings = cashPrice - presentValue;
    const savingsPercent = (savings / cashPrice) * 100;

    return {
      inflationRate,
      presentValue,
      savings,
      savingsPercent,
      recommendation: presentValue < cashPrice ? "installments" : "cash",
    };
  };

  const handleCalculate = () => {
    const cash = Number.parseFloat(cashPrice.replace(/\./g, "").replace(",", "."));
    const totalInstallments = Number.parseFloat(
      totalInstallmentPrice.replace(/\./g, "").replace(",", "."),
    );
    const installments = Number.parseInt(numberOfInstallments);

    const monthlyInflation = customInflation
      ? Number.parseFloat(customInflation.replace(",", "."))
      : (inflation?.value || 0) / 12;

    if (
      Number.isNaN(cash) ||
      Number.isNaN(totalInstallments) ||
      Number.isNaN(installments) ||
      installments < 1
    ) {
      return;
    }

    const installment = totalInstallments / installments;
    const { presentValue, chartData } = calculatePresentValueWithData(
      installment,
      installments,
      monthlyInflation,
    );
    const savings = cash - presentValue;
    const savingsPercent = (savings / cash) * 100;

    setResult({
      cashPrice: cash,
      installmentPrice: totalInstallments,
      numberOfInstallments: installments,
      installmentValue: installment,
      monthlyInflation,
      presentValue,
      savings,
      savingsPercent,
      recommendation: presentValue < cash ? "installments" : "cash",
      chartData,
    });

    const inflationRates = [1, 2, 3, 4, 5, 6, 7, 8];
    const comparisons = inflationRates.map((rate) =>
      calculateForInflationRate(cash, installment, installments, rate),
    );
    setInflationComparisons(comparisons);
  };

  const handleSaveCalculation = () => {
    if (!result || !calculationName.trim()) return;

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
    setCashPrice(calc.cashPrice.toString());
    const total = calc.installmentValue * calc.numberOfInstallments;
    setTotalInstallmentPrice(total.toString());
    setNumberOfInstallments(calc.numberOfInstallments.toString());
    setCustomInflation(calc.monthlyInflation.toString());
    setTimeout(() => handleCalculate(), 100);
  };

  const handleDeleteCalculation = (id: string) => {
    const updated = savedCalculations.filter((c) => c.id !== id);
    setSavedCalculations(updated);
    localStorage.setItem("savedInstallmentCalculations", JSON.stringify(updated));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">¿Cuotas o Contado?</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Calculá si te conviene pagar en cuotas o de contado considerando la inflación
        </p>
      </div>

      {savedCalculations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cálculos guardados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedCalculations.map((calc) => (
                <div
                  key={calc.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{calc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(calc.cashPrice)} - {calc.numberOfInstallments}x de{" "}
                      {formatCurrency(calc.installmentValue)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleLoadCalculation(calc)}>
                      Cargar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteCalculation(calc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Datos de la compra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cashPrice">Ingresá el precio total al contado</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="cashPrice"
                  type="text"
                  placeholder="100.000"
                  value={cashPrice}
                  onChange={(e) => setCashPrice(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalInstallmentPrice">Ingresá el precio total en cuotas</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="totalInstallmentPrice"
                  type="text"
                  placeholder="120.000"
                  value={totalInstallmentPrice}
                  onChange={(e) => setTotalInstallmentPrice(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfInstallments">Cantidad de cuotas</Label>
              <Input
                id="numberOfInstallments"
                type="number"
                min="1"
                max="60"
                value={numberOfInstallments}
                onChange={(e) => setNumberOfInstallments(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customInflation">
                Inflación mensual estimada
                {loadingInflation ? (
                  <Skeleton className="h-4 w-20 inline-block ml-2" />
                ) : (
                  <span className="text-xs text-muted-foreground ml-2">
                    (por defecto: {((inflation?.value || 0) / 12).toFixed(2)}%)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="customInflation"
                  type="text"
                  placeholder={((inflation?.value || 0) / 12).toFixed(2)}
                  value={customInflation}
                  onChange={(e) => setCustomInflation(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Dejá en blanco para usar la inflación actual
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCalculate} className="flex-1" size="lg">
                Calcular
              </Button>
              {result && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowSaveDialog(true)}
                  className="gap-2"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Guardar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card
            className={`border-t-[3px] ${
              result.recommendation === "installments"
                ? "border-t-emerald-500"
                : "border-t-amber-500"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.recommendation === "installments" ? (
                  <>
                    <TrendingDown className="h-5 w-5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ¡Te conviene en cuotas!
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">
                      Te conviene de contado
                    </span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Precio de contado</p>
                  <p className="text-xl font-bold">{formatCurrency(result.cashPrice)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    {result.numberOfInstallments} cuotas de
                  </p>
                  <p className="text-xl font-bold">{formatCurrency(result.installmentValue)}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium mb-2">Valor presente de las cuotas</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(result.presentValue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Considerando {result.monthlyInflation.toFixed(2)}% de inflación mensual
                </p>
              </div>

              {result.recommendation === "installments" ? (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm font-medium mb-1 text-emerald-700 dark:text-emerald-400">
                    Ahorro en cuotas
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(result.savings)}
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    ({result.savingsPercent.toFixed(1)}% menos que de contado)
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm font-medium mb-1 text-amber-700 dark:text-amber-400">
                    Costo extra en cuotas
                  </p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(Math.abs(result.savings))}
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    ({Math.abs(result.savingsPercent).toFixed(1)}% más que de contado)
                  </p>
                </div>
              )}

              <div className="pt-4 border-t space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Total en cuotas:</strong> {formatCurrency(result.installmentPrice)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Este cálculo considera que el valor del dinero disminuye con la inflación.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!result && (
          <Card className="flex items-center justify-center min-h-[400px]">
            <CardContent className="text-center text-muted-foreground">
              <Calculator className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm">
                Completá los datos de tu compra para ver si te conviene pagar de contado o en cuotas
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {result && (
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
