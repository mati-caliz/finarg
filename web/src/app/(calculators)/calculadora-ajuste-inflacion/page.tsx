"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdjustInflation } from "@/hooks/useInflation";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { InflationAdjustment } from "@/types";
import { Calculator, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";

export default function InflationAdjustmentCalculatorPage() {
  const { translate } = useTranslation();
  const [originalAmount, setOriginalAmount] = useState<number>(100000);
  const [startDate, setStartDate] = useState<string>("2023-01-01");
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [adjustmentResult, setAdjustmentResult] = useState<InflationAdjustment | null>(null);

  const adjustMutation = useAdjustInflation();

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    adjustMutation.mutate(
      { amount: originalAmount, fromDate: startDate, toDate: endDate },
      {
        onSuccess: (data) => {
          setAdjustmentResult(data);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{translate("adjustmentCalculator")}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {translate("adjustmentCalculatorDesc")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card lg:self-start">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              {translate("adjustmentCalculator")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleAdjust} className="space-y-3">
              <div>
                <label
                  htmlFor="originalAmount"
                  className="block text-sm font-medium text-muted-foreground mb-2"
                >
                  {translate("originalAmount")}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="originalAmount"
                    type="number"
                    placeholder="100000"
                    value={originalAmount || ""}
                    onChange={(e) => setOriginalAmount(Number.parseFloat(e.target.value) || 0)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-muted-foreground mb-2"
                >
                  {translate("startDate")}
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-muted-foreground mb-2"
                >
                  {translate("endDate")}
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={adjustMutation.isPending || originalAmount <= 0}
              >
                {adjustMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate("calculating")}
                  </>
                ) : (
                  translate("calculateAdjustment")
                )}
              </Button>
            </form>

            {adjustmentResult && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      {translate("originalAmount")}
                    </span>
                    <span className="text-foreground">
                      {formatCurrency(adjustmentResult.originalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      {translate("monthsElapsed")}
                    </span>
                    <span className="text-foreground">{adjustmentResult.monthsElapsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      {translate("cumulativeInflation")}
                    </span>
                    <span className="text-red-500">
                      +
                      {formatPercent(
                        adjustmentResult.cumulativeInflation ??
                          adjustmentResult.accumulatedInflation ??
                          0,
                      )}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground font-medium">
                        {translate("adjustedAmount")}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(adjustmentResult.adjustedAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {translate("maintainPurchasingPower")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">{translate("howItWorks")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {translate("whatIsInflationAdjustment")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {translate("inflationAdjustmentExplanation")}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {translate("howToUse")}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>{translate("adjustmentStep1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>{translate("adjustmentStep2")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>{translate("adjustmentStep3")}</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-amber-500" />
                {translate("practicalExample")}
              </h3>
              <p className="text-sm text-muted-foreground">{translate("adjustmentExample")}</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {translate("dataSource")}
              </h3>
              <p className="text-sm text-muted-foreground">{translate("inflationDataSource")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
