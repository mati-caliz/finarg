import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useROICalculator } from "@/hooks/useROICalculator";
import type { ROIRequest } from "@/types";
import { Calculator, DollarSign, Home, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

export function ROICalculator() {
  const { mutate, data, isPending } = useROICalculator();

  const [formData, setFormData] = useState<ROIRequest>({
    propertyPrice: 150000,
    monthlyRent: 800,
    monthlyExpenses: 200,
    annualAppreciationPercent: 3,
    downPaymentPercent: 20,
    mortgageInterestRate: 8,
    mortgageYears: 20,
    annualPropertyTax: 1000,
    annualMaintenanceCosts: 1500,
    currency: "USD",
    analysisYears: 10,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
  };

  const formatCurrency = (value: number) => {
    return `${formData.currency} ${value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Datos de la Propiedad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyPrice">Precio de la Propiedad</Label>
              <Input
                id="propertyPrice"
                type="number"
                value={formData.propertyPrice}
                onChange={(e) =>
                  setFormData({ ...formData, propertyPrice: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Alquiler Mensual</Label>
              <Input
                id="monthlyRent"
                type="number"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyExpenses">Gastos Mensuales (al alquilar)</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                value={formData.monthlyExpenses}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyExpenses: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: string) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="ARS">ARS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPaymentPercent">Cuota Inicial (%)</Label>
              <Input
                id="downPaymentPercent"
                type="number"
                value={formData.downPaymentPercent}
                onChange={(e) =>
                  setFormData({ ...formData, downPaymentPercent: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mortgageInterestRate">Tasa de Interés Hipotecario (%)</Label>
              <Input
                id="mortgageInterestRate"
                type="number"
                step="0.1"
                value={formData.mortgageInterestRate}
                onChange={(e) =>
                  setFormData({ ...formData, mortgageInterestRate: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mortgageYears">Años de Hipoteca</Label>
              <Input
                id="mortgageYears"
                type="number"
                value={formData.mortgageYears}
                onChange={(e) =>
                  setFormData({ ...formData, mortgageYears: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualPropertyTax">Impuesto Anual</Label>
              <Input
                id="annualPropertyTax"
                type="number"
                value={formData.annualPropertyTax}
                onChange={(e) =>
                  setFormData({ ...formData, annualPropertyTax: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualMaintenanceCosts">Mantenimiento Anual</Label>
              <Input
                id="annualMaintenanceCosts"
                type="number"
                value={formData.annualMaintenanceCosts}
                onChange={(e) =>
                  setFormData({ ...formData, annualMaintenanceCosts: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualAppreciationPercent">Apreciación Anual (%)</Label>
              <Input
                id="annualAppreciationPercent"
                type="number"
                step="0.1"
                value={formData.annualAppreciationPercent}
                onChange={(e) =>
                  setFormData({ ...formData, annualAppreciationPercent: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="analysisYears">Años de Análisis</Label>
              <Input
                id="analysisYears"
                type="number"
                value={formData.analysisYears}
                onChange={(e) =>
                  setFormData({ ...formData, analysisYears: Number(e.target.value) })
                }
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Calculando..." : "Calcular ROI"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {data && (
        <div className="space-y-6">
          <Card className="border-t-[3px] border-t-emerald-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Escenario: Comprar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cuota Inicial</p>
                  <p className="font-semibold">{formatCurrency(data.buyScenario.downPayment)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pago Mensual</p>
                  <p className="font-semibold">
                    {formatCurrency(data.buyScenario.monthlyMortgagePayment)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interés Total Hipoteca</p>
                  <p className="font-semibold">
                    {formatCurrency(data.buyScenario.totalMortgageInterest)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Final Propiedad</p>
                  <p className="font-semibold">
                    {formatCurrency(data.buyScenario.propertyValueAtEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patrimonio Neto Final</p>
                  <p className="font-semibold text-emerald-600">
                    {formatCurrency(data.buyScenario.netWorthAtEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROI Anualizado</p>
                  <p className="font-semibold">{formatPercent(data.buyScenario.annualizedROI)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-[3px] border-t-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Escenario: Alquilar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alquiler Pagado</p>
                  <p className="font-semibold">{formatCurrency(data.rentScenario.totalRentPaid)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Gastos Pagados</p>
                  <p className="font-semibold">
                    {formatCurrency(data.rentScenario.totalExpensesPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Inversión</p>
                  <p className="font-semibold">
                    {formatCurrency(data.rentScenario.investmentValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Retornos Inversión</p>
                  <p className="font-semibold">
                    {formatCurrency(data.rentScenario.investmentReturns)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Patrimonio Neto Final</p>
                  <p className="font-semibold text-blue-600">
                    {formatCurrency(data.rentScenario.netWorthAtEnd)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border-t-[3px] ${data.comparison.betterOption === "BUY" ? "border-t-emerald-500" : "border-t-blue-500"}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {data.comparison.betterOption === "BUY" ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                Comparación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Diferencia de Patrimonio</span>
                  <span
                    className={`font-bold ${data.comparison.netWorthDifference >= 0 ? "text-emerald-600" : "text-blue-600"}`}
                  >
                    {formatCurrency(Math.abs(data.comparison.netWorthDifference))}
                  </span>
                </div>
                {data.breakEvenYear && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Punto de Equilibrio</span>
                    <span className="font-semibold">{data.breakEvenYear} años</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  <span
                    className={`font-bold ${data.comparison.betterOption === "BUY" ? "text-emerald-600" : "text-blue-600"}`}
                  >
                    {data.comparison.betterOption === "BUY" ? "COMPRAR" : "ALQUILAR"}
                  </span>{" "}
                  es la mejor opción
                </p>
                <p className="text-sm text-muted-foreground mt-2">{data.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
