"use client";

import { Paywall } from "@/components/Paywall";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useStore";
import dynamic from "next/dynamic";

const LineChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.LineChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  },
);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { compoundInterestApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { CompoundInterestRequest, CompoundInterestResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  DollarSign,
  HelpCircle,
  Loader2,
  Percent,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

export default function CompoundInterestCalculatorPage() {
  const { translate } = useTranslation();
  const { subscription } = useAuthStore();
  const [showPaywall, setShowPaywall] = useState(false);
  const [formData, setFormData] = useState<CompoundInterestRequest>({
    initialCapital: 0,
    annualRate: 8,
    years: 5,
    compoundingFrequency: "MONTHLY",
    periodicContribution: 0,
  });
  const [result, setResult] = useState<CompoundInterestResponse | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqItems: { questionKey: TranslationKey; answerKey: TranslationKey }[] = [
    { questionKey: "faqCompoundInterestQuestion", answerKey: "faqCompoundInterestAnswer" },
    {
      questionKey: "faqCompoundingFrequencyQuestion",
      answerKey: "faqCompoundingFrequencyAnswer",
    },
    { questionKey: "faqPeriodicContributionQuestion", answerKey: "faqPeriodicContributionAnswer" },
    { questionKey: "faqCompoundVsSimpleQuestion", answerKey: "faqCompoundVsSimpleAnswer" },
  ];

  const calculateMutation = useMutation({
    mutationFn: async (data: CompoundInterestRequest) => {
      const response = await compoundInterestApi.calculate(data);
      return response.data as CompoundInterestResponse;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const canCalculate = subscription?.currentUsage?.canUseCalculator ?? true;

    if (!canCalculate) {
      setShowPaywall(true);
      return;
    }

    calculateMutation.mutate(formData);
  };

  const handleInputChange = (
    field: keyof CompoundInterestRequest,
    value: CompoundInterestRequest[keyof CompoundInterestRequest],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {showPaywall && (
        <Paywall
          feature="Calculadora de Interés Compuesto"
          description={`Has usado ${subscription?.currentUsage?.calculationsUsedToday ?? 0} de ${subscription?.currentUsage?.calculationsLimit ?? 3} cálculos hoy. Actualizá a Premium para cálculos ilimitados.`}
          onClose={() => setShowPaywall(false)}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {translate("compoundInterestTitle")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {translate("compoundInterestSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-primary" />
                {translate("investmentData")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="initialCapital"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {translate("initialCapital")}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="initialCapital"
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="0"
                        value={formData.initialCapital || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "initialCapital",
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="annualRate"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {translate("annualInterestRate")}
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="annualRate"
                        type="number"
                        min="0"
                        max="200"
                        step="0.1"
                        placeholder="8"
                        value={formData.annualRate || ""}
                        onChange={(e) =>
                          handleInputChange("annualRate", Number.parseFloat(e.target.value) || 0)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="years"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {translate("investmentPeriod")} ({translate("years")})
                    </label>
                    <Input
                      id="years"
                      type="number"
                      min="1"
                      max="50"
                      placeholder="5"
                      value={formData.years || ""}
                      onChange={(e) =>
                        handleInputChange("years", Number.parseInt(e.target.value) || 1)
                      }
                    />
                  </div>

                  <div>
                    <p className="block text-sm font-medium text-foreground mb-2">
                      {translate("compoundingFrequency")}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          formData.compoundingFrequency === "MONTHLY" ? "default" : "outline"
                        }
                        onClick={() => handleInputChange("compoundingFrequency", "MONTHLY")}
                      >
                        {translate("monthly")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          formData.compoundingFrequency === "QUARTERLY" ? "default" : "outline"
                        }
                        onClick={() => handleInputChange("compoundingFrequency", "QUARTERLY")}
                      >
                        {translate("quarterly")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={formData.compoundingFrequency === "YEARLY" ? "default" : "outline"}
                        onClick={() => handleInputChange("compoundingFrequency", "YEARLY")}
                      >
                        {translate("yearly")}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="periodicContribution"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {translate("periodicContribution")} ({translate("optional")})
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="periodicContribution"
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="0"
                        value={formData.periodicContribution || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "periodicContribution",
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {translate("periodicContributionNote")}
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={calculateMutation.isPending || formData.initialCapital <= 0}
                >
                  {calculateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {translate("calculating")}
                    </>
                  ) : (
                    translate("calculate")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {result ? (
              <>
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{translate("calculationResult")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-lg bg-green-500/20 border border-green-500/30">
                        <span className="font-medium text-foreground">
                          {translate("finalAmount")}
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(result.finalAmount)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            {translate("totalContributions")}
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(result.totalContributions)}
                          </p>
                        </div>
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <p className="text-xs text-muted-foreground mb-1">
                            {translate("totalInterest")}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(result.totalInterest)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-2">
                          {translate("interestEarnings")}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-primary to-green-500 h-full transition-all duration-500"
                              style={{
                                width: `${(result.totalInterest / result.finalAmount) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-primary">
                            {((result.totalInterest / result.finalAmount) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {result.periods.length > 0 && (
                  <Card className="bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        {translate("growthEvolution")}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Monto total acumulado (capital + aportes + intereses) mes a mes
                      </p>
                    </CardHeader>
                    <CardContent>
                      <LineChart
                        data={result.periods.map((p) => ({
                          mes: `Mes ${p.period}`,
                          total: p.total,
                        }))}
                        xKey="mes"
                        yKey="total"
                        colors={["#10b981"]}
                        height={300}
                        formatY={(v) => formatCurrency(Number(v))}
                        formatX={(v) => {
                          const match = v.toString().match(/Mes (\d+)/);
                          if (!match) {
                            return "";
                          }
                          const month = Number(match[1]);

                          const totalMonths = result.periods[result.periods.length - 1].period;

                          if (month === 1) {
                            return "1";
                          }
                          if (totalMonths <= 24) {
                            if (month % 6 === 0) {
                              return `${month}`;
                            }
                          } else if (totalMonths <= 60) {
                            if (month % 12 === 0) {
                              return `${month}`;
                            }
                          } else {
                            if (month % 24 === 0) {
                              return `${month}`;
                            }
                          }
                          if (month === totalMonths) {
                            return `${month}`;
                          }
                          return "";
                        }}
                        showGrid={false}
                      />

                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 text-muted-foreground">
                                {translate("months")}
                              </th>
                              <th className="text-right py-2 text-muted-foreground">
                                {translate("contributions")}
                              </th>
                              <th className="text-right py-2 text-muted-foreground">
                                {translate("interest")}
                              </th>
                              <th className="text-right py-2 text-muted-foreground">
                                {translate("total")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.periods.map((period) => (
                              <tr key={period.period} className="border-b border-border/50">
                                <td className="py-2 text-foreground">{period.period}</td>
                                <td className="text-right py-2 text-muted-foreground">
                                  {formatCurrency(period.principal + formData.initialCapital)}
                                </td>
                                <td className="text-right py-2 text-primary">
                                  {formatCurrency(period.interest)}
                                </td>
                                <td className="text-right py-2 text-foreground font-medium">
                                  {formatCurrency(period.total)}
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
                  <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{translate("completeFormMessage")}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {faqItems.map((item, index) => (
            <Card key={item.questionKey} className="bg-muted/30 border-muted overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-foreground text-left">
                  <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                  {translate(item.questionKey)}
                </span>
                {openFaqIndex === index ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {openFaqIndex === index && (
                <div className="px-3 pb-3 pt-0 border-t border-border/50">
                  <p className="text-xs text-muted-foreground leading-5">
                    {translate(item.answerKey)}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
