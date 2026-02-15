"use client";

import { Paywall } from "@/components/Paywall";
import { UsageBadge } from "@/components/UsageBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useStore";
import dynamic from "next/dynamic";

const BarChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.BarChart })),
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
import { incomeTaxApi } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { IncomeTaxRequest, IncomeTaxResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  DollarSign,
  GraduationCap,
  HelpCircle,
  Home,
  Loader2,
  Shield,
  UserX,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function IncomeTaxPage() {
  const { translate } = useTranslation();
  const { subscription } = useAuthStore();
  const [showPaywall, setShowPaywall] = useState(false);
  const [formData, setFormData] = useState<IncomeTaxRequest>({
    grossMonthlySalary: 0,
    isRetired: false,
    hasSpouse: false,
    childrenCount: 0,
    childrenWithDisabilitiesCount: 0,
    healthInsurance: undefined,
    retirement: undefined,
    union: undefined,
    unionDuesPercent: undefined,
    housingRent: undefined,
    domesticService: undefined,
    educationExpenses: undefined,
    lifeInsurance: undefined,
  });

  const [result, setResult] = useState<IncomeTaxResponse | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqItems: { questionKey: TranslationKey; answerKey: TranslationKey }[] = [
    { questionKey: "faqNetVsGrossQuestion", answerKey: "faqNetVsGrossAnswer" },
    { questionKey: "faqWhatIsIncomeTaxQuestion", answerKey: "faqWhatIsIncomeTaxAnswer" },
    { questionKey: "faqWhatAreDeductionsQuestion", answerKey: "faqWhatAreDeductionsAnswer" },
    { questionKey: "faqValuesDisclaimerQuestion", answerKey: "faqValuesDisclaimerAnswer" },
  ];

  const calculateMutation = useMutation({
    mutationFn: async (data: IncomeTaxRequest) => {
      const response = await incomeTaxApi.calculate(data);
      return response.data as IncomeTaxResponse;
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
    field: keyof IncomeTaxRequest,
    value: IncomeTaxRequest[keyof IncomeTaxRequest],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {showPaywall && (
        <Paywall
          feature="Calculadora de Sueldo Neto"
          description={`Has usado ${subscription?.currentUsage?.calculationsUsedToday ?? 0} de ${subscription?.currentUsage?.calculationsLimit ?? 3} cálculos hoy. Actualizá a Premium para cálculos ilimitados.`}
          onClose={() => setShowPaywall(false)}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translate("incomeTaxTitle")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{translate("incomeTaxSubtitle")}</p>
        </div>

        <UsageBadge />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-primary" />
                {translate("employeeData")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="grossMonthlySalary"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      {translate("grossMonthlySalary")}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="grossMonthlySalary"
                        type="number"
                        placeholder="0"
                        value={formData.grossMonthlySalary || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "grossMonthlySalary",
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                        <UserX className="h-4 w-4 text-muted-foreground" />
                        {translate("isRetired")}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={formData.isRetired ? "default" : "outline"}
                          onClick={() => handleInputChange("isRetired", true)}
                        >
                          {translate("yes")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={!formData.isRetired ? "default" : "outline"}
                          onClick={() => handleInputChange("isRetired", false)}
                        >
                          {translate("no")}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="unionDuesPercent"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        {translate("unionDuesPercent")}
                      </label>
                      <div className="flex items-center gap-1">
                        <Input
                          id="unionDuesPercent"
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="0"
                          value={formData.unionDuesPercent ?? ""}
                          onChange={(e) =>
                            handleInputChange(
                              "unionDuesPercent",
                              Number.parseFloat(e.target.value) || undefined,
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {translate("familyDependents")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="block text-xs text-muted-foreground mb-1">
                        {translate("spouse")}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={formData.hasSpouse ? "default" : "outline"}
                          onClick={() => handleInputChange("hasSpouse", true)}
                        >
                          {translate("yes")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={!formData.hasSpouse ? "default" : "outline"}
                          onClick={() => handleInputChange("hasSpouse", false)}
                        >
                          {translate("no")}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="childrenCount"
                        className="block text-xs text-muted-foreground mb-1"
                      >
                        {translate("numberOfChildren")}
                      </label>
                      <Input
                        id="childrenCount"
                        type="number"
                        min="0"
                        max="10"
                        value={formData.childrenCount}
                        onChange={(e) =>
                          handleInputChange("childrenCount", Number.parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="childrenWithDisabilitiesCount"
                        className="block text-xs text-muted-foreground mb-1"
                      >
                        {translate("childrenWithDisabilities")}
                      </label>
                      <Input
                        id="childrenWithDisabilitiesCount"
                        type="number"
                        min="0"
                        max={formData.childrenCount}
                        value={formData.childrenWithDisabilitiesCount ?? 0}
                        onChange={(e) =>
                          handleInputChange(
                            "childrenWithDisabilitiesCount",
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    {translate("optionalDeductions")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="housingRent"
                        className="block text-xs text-muted-foreground mb-1"
                      >
                        {translate("housingRent")}
                      </label>
                      <Input
                        id="housingRent"
                        type="number"
                        placeholder="0"
                        value={formData.housingRent || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "housingRent",
                            Number.parseFloat(e.target.value) || undefined,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="domesticService"
                        className="block text-xs text-muted-foreground mb-1"
                      >
                        {translate("domesticService")}
                      </label>
                      <Input
                        id="domesticService"
                        type="number"
                        placeholder="0"
                        value={formData.domesticService || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "domesticService",
                            Number.parseFloat(e.target.value) || undefined,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="educationExpenses"
                      className="flex items-center gap-1 text-xs text-muted-foreground mb-1"
                    >
                      <GraduationCap className="h-3 w-3" />
                      {translate("educationalExpenses")}
                    </label>
                    <Input
                      id="educationExpenses"
                      type="number"
                      placeholder="0"
                      value={formData.educationExpenses ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          "educationExpenses",
                          Number.parseFloat(e.target.value) || undefined,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lifeInsurance"
                      className="flex items-center gap-1 text-xs text-muted-foreground mb-1"
                    >
                      <Shield className="h-3 w-3" />
                      {translate("lifeInsurance")}
                    </label>
                    <Input
                      id="lifeInsurance"
                      type="number"
                      placeholder="0"
                      value={formData.lifeInsurance ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          "lifeInsurance",
                          Number.parseFloat(e.target.value) || undefined,
                        )
                      }
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={calculateMutation.isPending || formData.grossMonthlySalary <= 0}
                >
                  {calculateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {translate("calculating")}
                    </>
                  ) : (
                    translate("calculateTax")
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
                    <div className="mb-6">
                      <div className="flex justify-between items-center p-4 rounded-lg bg-green-500/20 border border-green-500/30 mb-4">
                        <span className="font-medium text-foreground">
                          {translate("monthlyNetSalary")}
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(result.monthlyNetSalary)}
                        </span>
                      </div>
                      {result.deductionBreakdown ? (
                        <>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            {translate("deductionBreakdownTitle")}
                          </p>
                          <div className="space-y-0 divide-y divide-border rounded-lg border border-border">
                            {[
                              {
                                key: "retirement",
                                label: translate("retirement"),
                                value: result.deductionBreakdown.retirement,
                              },
                              {
                                key: "healthInsurance",
                                label: translate("healthInsurance"),
                                value: result.deductionBreakdown.healthInsurance,
                              },
                              {
                                key: "law19032",
                                label: translate("law19032"),
                                value: result.deductionBreakdown.law19032,
                              },
                              {
                                key: "unionDues",
                                label: translate("unionDues"),
                                value: result.deductionBreakdown.unionDues,
                              },
                              {
                                key: "incomeTax",
                                label: translate("incomeTaxLabel"),
                                value: result.deductionBreakdown.incomeTax,
                              },
                            ].map(({ key, label, value }) => (
                              <div key={key} className="flex justify-between py-3 px-4">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium text-red-500 dark:text-red-400">
                                  {formatCurrency(value ?? 0)}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between py-3 px-4 font-medium bg-muted/30">
                              <span className="text-foreground">
                                {translate("totalDeductionsLabel")}
                              </span>
                              <span className="text-red-500 dark:text-red-400">
                                {formatCurrency(result.deductionBreakdown.total ?? 0)}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2 text-sm p-4 bg-muted/30 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {translate("grossMonthlySalary")}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(
                                result.grossMonthlySalary ?? formData.grossMonthlySalary,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>− {translate("monthlyLegalDeductions")}</span>
                            <span>{formatCurrency(result.monthlyLegalDeductions ?? 0)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>− {translate("monthlyTax")}</span>
                            <span>{formatCurrency(result.monthlyTax)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-border">
                      <p className="text-sm font-medium text-muted-foreground mb-4">
                        {translate("annualSummary")}
                      </p>
                      {result.annualTax === 0 && (result.taxableNetIncome ?? 0) <= 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                          {translate("noTaxOwed")}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-5">
                        <div className="p-5 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            {translate("annualGrossSalary")}
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(result.grossAnnualSalary)}
                          </p>
                        </div>
                        <div className="p-5 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            {translate("taxableNetIncome")}
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(result.taxableNetIncome)}
                          </p>
                        </div>
                        <div className="p-5 bg-destructive/10 rounded-lg border border-destructive/20">
                          <p className="text-xs text-muted-foreground mb-1">
                            {translate("annualTax")}
                          </p>
                          <p className="text-lg font-bold text-red-500 dark:text-red-400">
                            {formatCurrency(result.annualTax)}
                          </p>
                        </div>
                        <div className="p-5 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            {translate("effectiveRate")}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {formatPercent(result.effectiveRate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{translate("deductionsDetail")}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {translate("deductionsMonthlyNote")}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">
                          {translate("nonTaxableMinimum")}
                        </span>
                        <span className="text-foreground">
                          {formatCurrency((result.calculationDetails.nonTaxableMinimum ?? 0) / 12)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">
                          {translate("specialDeduction")}
                        </span>
                        <span className="text-foreground">
                          {formatCurrency((result.calculationDetails.specialDeduction ?? 0) / 12)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">
                          {translate("familyDependents")}
                        </span>
                        <span className="text-foreground">
                          {formatCurrency((result.calculationDetails.familyCharges ?? 0) / 12)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">
                          {translate("personalDeductions")}
                        </span>
                        <span className="text-foreground">
                          {formatCurrency((result.calculationDetails.personalDeductions ?? 0) / 12)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 font-bold">
                        <span className="text-foreground">
                          {translate("totalAllowedDeductions")}
                        </span>
                        <span className="text-green-500">
                          {formatCurrency(
                            (result.calculationDetails.totalAllowedDeductions ?? 0) / 12,
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {result.bracketBreakdown && result.bracketBreakdown.length > 0 && (
                  <Card className="bg-card">
                    <CardHeader>
                      <CardTitle className="text-lg">{translate("breakdownByBracket")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BarChart
                        data={result.bracketBreakdown.map((item) => ({
                          tramo: `${translate("bracket")} ${item.bracket}`,
                          impuesto: item.bracketTax,
                          alicuota: item.rate,
                        }))}
                        xKey="tramo"
                        yKey="impuesto"
                        color="#ef4444"
                        height={200}
                        formatY={(v) => formatCurrency(Number(v))}
                      />
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 text-muted-foreground">
                                {translate("bracket")}
                              </th>
                              <th className="text-right py-2 text-muted-foreground">
                                {translate("from")}
                              </th>
                              <th className="text-right py-2 text-muted-foreground">
                                {translate("to")}
                              </th>
                              <th className="text-right py-2 text-muted-foreground">
                                {translate("rate")}
                              </th>
                              <th className="text-right py-2 text-muted-foreground">
                                {translate("taxBase")}
                              </th>
                              <th className="text-right py-2 text-muted-foreground">
                                {translate("tax")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.bracketBreakdown.map((bracket) => (
                              <tr key={bracket.bracket} className="border-b border-border/50">
                                <td className="py-2 text-foreground">{bracket.bracket}</td>
                                <td className="text-right py-2 text-muted-foreground">
                                  {formatCurrency(bracket.from)}
                                </td>
                                <td className="text-right py-2 text-muted-foreground">
                                  {formatCurrency(bracket.to)}
                                </td>
                                <td className="text-right py-2 text-primary">{bracket.rate}%</td>
                                <td className="text-right py-2 text-foreground">
                                  {formatCurrency(bracket.taxableBase)}
                                </td>
                                <td className="text-right py-2 text-red-500">
                                  {formatCurrency(bracket.bracketTax)}
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
