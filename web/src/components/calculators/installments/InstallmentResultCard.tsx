"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "./formatCurrency";
import type { CalculationResult } from "./types";

interface InstallmentResultCardProps {
  result: CalculationResult | null;
}

export default function InstallmentResultCard({ result }: InstallmentResultCardProps) {
  if (result === null) {
    return (
      <Card className="flex items-center justify-center min-h-[400px]">
        <CardContent className="text-center text-muted-foreground">
          <Calculator className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm">
            Completá los datos de tu compra para ver si te conviene pagar de contado o en cuotas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border-t-[3px] ${
        result.recommendation === "installments" ? "border-t-emerald-500" : "border-t-amber-500"
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
              <span className="text-amber-600 dark:text-amber-400">Te conviene de contado</span>
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
          <p className="text-2xl font-bold text-primary">{formatCurrency(result.presentValue)}</p>
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
  );
}
