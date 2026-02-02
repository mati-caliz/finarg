"use client";

import { LineChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { reposApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  Calculator,
  Calendar,
  CheckCircle,
  Coins,
  DollarSign,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface RepoResult {
  initialAmount: number;
  termDays: number;
  rateTNA: number;
  rateTEA: number;
  totalReturn: number;
  finalAmount: number;
  profitARS: number;
  estimatedCommission: number;
  netReturn: number;
  optimalStrategy: string;
  comparison: {
    term: number;
    rateTNA: number;
    finalAmount: number;
    returnRate: number;
  }[];
  recommendations: string[];
}

export default function ReposPage() {
  const { translate } = useTranslation();
  const [amount, setAmount] = useState<number>(1000000);
  const [termDays, setTermDays] = useState<number>(7);
  const [result, setResult] = useState<RepoResult | null>(null);

  const TERMS = [
    { value: 1, label: `1 ${translate("days7").replace("7 ", "")}`.replace("s", "") }, // Hacky but simple for 'day' vs 'days'
    { value: 7, label: translate("days7") },
    { value: 14, label: `14 ${translate("days7").replace("7 ", "")}` },
    { value: 30, label: translate("days30") },
    { value: 60, label: `60 ${translate("days7").replace("7 ", "")}` },
  ];

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await reposApi.optimize(amount, termDays);
      return response.data as RepoResult;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    optimizeMutation.mutate();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{translate("repoOptimizer")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{translate("repoDescription")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-primary" />
              {translate("configureRepo")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
                  {translate("amountToInvest")}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000000"
                    value={amount || ""}
                    onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(amount)}</p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {translate("term")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {TERMS.map((term) => (
                    <Button
                      key={term.value}
                      type="button"
                      variant={termDays === term.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTermDays(term.value)}
                    >
                      {term.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={optimizeMutation.isPending || amount <= 0}
              >
                {optimizeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate("optimizing")}
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    {translate("optimizeRepo")}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/60 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">
                {translate("whatIsRepo")}
              </h4>
              <p className="text-sm text-muted-foreground">{translate("repoInfo")}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{translate("finalAmount")}</p>
                    <p className="text-xl font-bold text-foreground mt-1">
                      {formatCurrency(result.finalAmount)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{translate("grossProfit")}</p>
                    <p className="text-xl font-bold text-green-500 mt-1">
                      +{formatCurrency(result.profitARS)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">TNA</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      {formatPercent(result.rateTNA)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">TEA</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      {formatPercent(result.rateTEA)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">{translate("operationDetail")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{translate("amountToInvest")}</span>
                        <span className="text-foreground">
                          {formatCurrency(result.initialAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{translate("term")}</span>
                        <span className="text-foreground">
                          {result.termDays} {translate("days7").replace("7 ", "")}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{translate("grossProfit")}</span>
                        <span className="text-green-500">+{formatPercent(result.totalReturn)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{translate("estCommission")}</span>
                        <span className="text-red-500">
                          -{formatCurrency(result.estimatedCommission)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{translate("netReturn")}</span>
                        <span className="text-green-500">{formatPercent(result.netReturn)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-foreground font-medium">
                          {translate("finalAmount")}
                        </span>
                        <span className="text-primary font-bold">
                          {formatCurrency(result.finalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {result.optimalStrategy && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-primary">
                            {translate("optimalStrategy")}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.optimalStrategy}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {result.comparison && result.comparison.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{translate("termComparison")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={result.comparison.map((c) => ({
                        plazo: `${c.term}d`,
                        tasaTNA: c.rateTNA,
                        rendimiento: c.returnRate,
                      }))}
                      xKey="plazo"
                      yKey={["tasaTNA"]}
                      colors={["#10b981"]}
                      height={200}
                      formatY={(v) => `${Number(v).toFixed(1)}%`}
                    />

                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 text-muted-foreground">
                              {translate("term")}
                            </th>
                            <th className="text-right py-2 text-muted-foreground">TNA</th>
                            <th className="text-right py-2 text-muted-foreground">
                              {translate("finalAmount")}
                            </th>
                            <th className="text-right py-2 text-muted-foreground">Return</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.comparison.map((comp) => (
                            <tr
                              key={comp.term}
                              className={`border-b border-border/50 ${
                                comp.term === result.termDays ? "bg-primary/5" : ""
                              }`}
                            >
                              <td className="py-2 text-foreground">
                                {comp.term} {translate("days7").replace("7 ", "")}
                                {comp.term === result.termDays && (
                                  <span className="ml-2 text-xs text-primary">(selected)</span>
                                )}
                              </td>
                              <td className="text-right py-2 text-primary">
                                {formatPercent(comp.rateTNA)}
                              </td>
                              <td className="text-right py-2 text-foreground">
                                {formatCurrency(comp.finalAmount)}
                              </td>
                              <td className="text-right py-2 text-green-500">
                                +{formatPercent(comp.returnRate)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {translate("recommendations")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec) => (
                        <li key={rec} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="text-primary mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-card h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{translate("repoPlaceholder")}</p>
                <p className="text-muted-foreground text-sm mt-2">
                  {translate("repoPlaceholderDesc")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-500 font-medium mb-1">{translate("importantInfo")}</p>
              <p className="text-muted-foreground">{translate("repoDisclaimer")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
