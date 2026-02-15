"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { IncomeTaxResponse } from "@/types";
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

interface IncomeTaxResultsProps {
  result: IncomeTaxResponse;
  grossMonthlySalary: number;
}

export function IncomeTaxResults({ result, grossMonthlySalary }: IncomeTaxResultsProps) {
  const { translate } = useTranslation();

  return (
    <>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">{translate("calculationResult")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center p-4 rounded-lg bg-green-500/20 border border-green-500/30 mb-4">
              <span className="font-medium text-foreground">{translate("monthlyNetSalary")}</span>
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
                    <span className="text-foreground">{translate("totalDeductionsLabel")}</span>
                    <span className="text-red-500 dark:text-red-400">
                      {formatCurrency(result.deductionBreakdown.total ?? 0)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2 text-sm p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{translate("grossMonthlySalary")}</span>
                  <span className="font-medium">
                    {formatCurrency(result.grossMonthlySalary ?? grossMonthlySalary)}
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
                <p className="text-xs text-muted-foreground mb-1">{translate("annualTax")}</p>
                <p className="text-lg font-bold text-red-500 dark:text-red-400">
                  {formatCurrency(result.annualTax)}
                </p>
              </div>
              <div className="p-5 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{translate("effectiveRate")}</p>
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
          <p className="text-xs text-muted-foreground mt-1">{translate("deductionsMonthlyNote")}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{translate("nonTaxableMinimum")}</span>
              <span className="text-foreground">
                {formatCurrency((result.calculationDetails.nonTaxableMinimum ?? 0) / 12)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{translate("specialDeduction")}</span>
              <span className="text-foreground">
                {formatCurrency((result.calculationDetails.specialDeduction ?? 0) / 12)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{translate("familyDependents")}</span>
              <span className="text-foreground">
                {formatCurrency((result.calculationDetails.familyCharges ?? 0) / 12)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{translate("personalDeductions")}</span>
              <span className="text-foreground">
                {formatCurrency((result.calculationDetails.personalDeductions ?? 0) / 12)}
              </span>
            </div>
            <div className="flex justify-between py-2 font-bold">
              <span className="text-foreground">{translate("totalAllowedDeductions")}</span>
              <span className="text-green-500">
                {formatCurrency((result.calculationDetails.totalAllowedDeductions ?? 0) / 12)}
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
                    <th className="text-left py-2 text-muted-foreground">{translate("bracket")}</th>
                    <th className="text-right py-2 text-muted-foreground">{translate("from")}</th>
                    <th className="text-right py-2 text-muted-foreground">{translate("to")}</th>
                    <th className="text-right py-2 text-muted-foreground">{translate("rate")}</th>
                    <th className="text-right py-2 text-muted-foreground">
                      {translate("taxBase")}
                    </th>
                    <th className="text-right py-2 text-muted-foreground">{translate("tax")}</th>
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
  );
}
