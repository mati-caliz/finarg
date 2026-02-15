"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkPlus, Calculator } from "lucide-react";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import type { CalculationResult, ChartDataPoint, InflationComparison } from "./types";

interface InstallmentCalculatorFormProps {
  onCalculate: (result: CalculationResult, comparisons: InflationComparison[]) => void;
  onSave: () => void;
  hasResult: boolean;
  inflation: { value: number } | undefined;
  loadingInflation: boolean;
}

export interface InstallmentCalculatorFormHandle {
  loadValues: (
    cashPriceValue: string,
    totalInstallmentPriceValue: string,
    numberOfInstallmentsValue: string,
    customInflationValue: string,
  ) => void;
}

function calculatePresentValueWithData(
  installmentValue: number,
  numberOfInstallments: number,
  monthlyInflation: number,
): { presentValue: number; chartData: ChartDataPoint[] } {
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
}

function calculateForInflationRate(
  cashPriceVal: number,
  installmentValue: number,
  numberOfInstallments: number,
  inflationRate: number,
): InflationComparison {
  const { presentValue } = calculatePresentValueWithData(
    installmentValue,
    numberOfInstallments,
    inflationRate,
  );
  const savings = cashPriceVal - presentValue;
  const savingsPercent = (savings / cashPriceVal) * 100;

  return {
    inflationRate,
    presentValue,
    savings,
    savingsPercent,
    recommendation: presentValue < cashPriceVal ? "installments" : "cash",
  };
}

const InstallmentCalculatorForm = forwardRef<
  InstallmentCalculatorFormHandle,
  InstallmentCalculatorFormProps
>(function InstallmentCalculatorForm(
  { onCalculate, onSave, hasResult, inflation, loadingInflation },
  ref,
) {
  const [cashPrice, setCashPrice] = useState<string>("");
  const [totalInstallmentPrice, setTotalInstallmentPrice] = useState<string>("");
  const [numberOfInstallments, setNumberOfInstallments] = useState<string>("12");
  const [customInflation, setCustomInflation] = useState<string>("");

  const runCalculation = useCallback(
    (
      cashPriceStr: string,
      totalInstallmentPriceStr: string,
      numberOfInstallmentsStr: string,
      customInflationStr: string,
    ) => {
      const cash = Number.parseFloat(cashPriceStr.replace(/\./g, "").replace(",", "."));
      const totalInstallments = Number.parseFloat(
        totalInstallmentPriceStr.replace(/\./g, "").replace(",", "."),
      );
      const installments = Number.parseInt(numberOfInstallmentsStr);

      const monthlyInflation = customInflationStr
        ? Number.parseFloat(customInflationStr.replace(",", "."))
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

      const result: CalculationResult = {
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
      };

      const inflationRates = [1, 2, 3, 4, 5, 6, 7, 8];
      const comparisons = inflationRates.map((rate) =>
        calculateForInflationRate(cash, installment, installments, rate),
      );

      onCalculate(result, comparisons);
    },
    [inflation, onCalculate],
  );

  const handleCalculate = () => {
    runCalculation(cashPrice, totalInstallmentPrice, numberOfInstallments, customInflation);
  };

  useImperativeHandle(ref, () => ({
    loadValues(
      cashPriceValue: string,
      totalInstallmentPriceValue: string,
      numberOfInstallmentsValue: string,
      customInflationValue: string,
    ) {
      setCashPrice(cashPriceValue);
      setTotalInstallmentPrice(totalInstallmentPriceValue);
      setNumberOfInstallments(numberOfInstallmentsValue);
      setCustomInflation(customInflationValue);
      setTimeout(() => {
        runCalculation(
          cashPriceValue,
          totalInstallmentPriceValue,
          numberOfInstallmentsValue,
          customInflationValue,
        );
      }, 100);
    },
  }));

  return (
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
          {hasResult && (
            <Button variant="outline" size="lg" onClick={onSave} className="gap-2">
              <BookmarkPlus className="h-4 w-4" />
              Guardar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default InstallmentCalculatorForm;
