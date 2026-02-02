"use client";

import { LineChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { simulatorApi } from "@/lib/api";
import type { SimulationRequest, SimulationResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bitcoin,
  Building,
  Calendar,
  Coins,
  DollarSign,
  Loader2,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

export default function SimulatorPage() {
  const { translate } = useTranslation();
  const [formData, setFormData] = useState<SimulationRequest>({
    initialAmount: 0,
    investmentType: "FIXED_TERM",
    termDays: 30,
    reinvest: true,
  });

  const [result, setResult] = useState<SimulationResponse | null>(null);

  const INVESTMENT_TYPES = [
    { value: "FIXED_TERM", label: translate("fixedTerm"), icon: Building, color: "text-blue-500" },
    {
      value: "FIXED_TERM_UVA",
      label: translate("fixedTermUva"),
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      value: "MONEY_MARKET_FUND",
      label: translate("moneyMarket"),
      icon: PiggyBank,
      color: "text-purple-500",
    },
    { value: "REPO", label: translate("repos"), icon: Coins, color: "text-yellow-500" },
    {
      value: "STABLECOIN_DAI",
      label: translate("stablecoin"),
      icon: Bitcoin,
      color: "text-orange-500",
    },
  ];

  const TERMS = [
    { value: 30, label: translate("days30") },
    { value: 60, label: `60 ${translate("days7").replace("7 ", "")}` },
    { value: 90, label: translate("months3") },
    { value: 180, label: translate("months6") },
    { value: 365, label: translate("year1") },
  ];

  useQuery({
    queryKey: ["rates"],
    queryFn: async () => {
      const response = await simulatorApi.getRates();
      return response.data;
    },
  });

  const simulateMutation = useMutation({
    mutationFn: async (data: SimulationRequest) => {
      const response = await simulatorApi.simulate(data);
      return response.data as SimulationResponse;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateMutation.mutate(formData);
  };

  const handleInputChange = (
    field: keyof SimulationRequest,
    value: SimulationRequest[keyof SimulationRequest],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

  const formatUSD = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{translate("investmentSimulator")}</h1>
        <p className="text-gray-400 text-sm mt-1">{translate("simulatorDesc")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              {translate("configureSimulation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="initialAmount"
                  className="block text-sm font-medium text-muted-foreground mb-2"
                >
                  {translate("amountToInvest")}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="initialAmount"
                    type="number"
                    placeholder="1000000"
                    value={formData.initialAmount || ""}
                    onChange={(e) =>
                      handleInputChange("initialAmount", Number.parseFloat(e.target.value) || 0)
                    }
                    className="pl-10"
                  />
                </div>
                {formData.initialAmount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(formData.initialAmount)}
                  </p>
                )}
              </div>

              <div>
                <p className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("investmentType")}
                </p>
                <div className="space-y-2">
                  {INVESTMENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange("investmentType", type.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          formData.investmentType === type.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-muted/50 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 text-foreground"
                        }`}
                      >
                        <Icon className={`h-5 w-5 shrink-0 ${type.color}`} />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  {translate("term")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {TERMS.map((term) => (
                    <Button
                      key={term.value}
                      type="button"
                      variant={formData.termDays === term.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("termDays", term.value)}
                    >
                      {term.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="reinvest"
                  checked={formData.reinvest}
                  onChange={(e) => handleInputChange("reinvest", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary"
                />
                <label htmlFor="reinvest" className="text-sm text-muted-foreground">
                  {translate("reinvestInterest")}
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={simulateMutation.isPending || formData.initialAmount <= 0}
              >
                {simulateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate("simulating")}
                  </>
                ) : (
                  translate("simulateInvestment")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">{translate("finalAmount")}</p>
                    <p className="text-xl font-bold text-white mt-1">
                      {formatCurrency(result.finalAmount)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">{translate("arsProfit")}</p>
                    <p className="text-xl font-bold text-green-500 mt-1">
                      +{formatCurrency(result.profitARS)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">{translate("nominalReturn")}</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      {formatPercent(result.nominalReturn)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">{translate("realReturn")}</p>
                    <p
                      className={`text-xl font-bold mt-1 ${
                        result.realReturn >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {result.realReturn >= 0 ? "+" : ""}
                      {formatPercent(result.realReturn)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">{translate("simulationDetails")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">TNA</p>
                      <p className="text-lg font-semibold text-white">
                        {formatPercent(result.nominalAnnualRate)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">TEA</p>
                      <p className="text-lg font-semibold text-white">
                        {formatPercent(result.effectiveAnnualRate)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">{translate("usdProfitEst")}</p>
                      <p className="text-lg font-semibold text-green-500">
                        {formatUSD(result.profitUSD)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">{translate("usdReturn")}</p>
                      <p
                        className={`text-lg font-semibold ${
                          result.dollarReturn >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {result.dollarReturn >= 0 ? "+" : ""}
                        {formatPercent(result.dollarReturn)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result.projection && result.projection.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{translate("capitalProjection")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={result.projection.map((p) => ({
                        mes: `${translate("monthly").slice(0, 3)} ${p.month}`,
                        capital: p.accumulatedCapital,
                        rendimientoReal: p.realReturn,
                      }))}
                      xKey="mes"
                      yKey={["capital"]}
                      colors={["#10b981"]}
                      height={250}
                      formatY={(v) => `$${(Number(v) / 1000000).toFixed(2)}M`}
                    />
                  </CardContent>
                </Card>
              )}

              {result.projection && result.projection.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{translate("monthlyProjection")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-2 text-gray-400">{translate("monthly")}</th>
                            <th className="text-right py-2 text-gray-400">
                              {translate("capital")}
                            </th>
                            <th className="text-right py-2 text-gray-400">
                              {translate("interest")}
                            </th>
                            <th className="text-right py-2 text-gray-400">
                              {translate("estInflation")}
                            </th>
                            <th className="text-right py-2 text-gray-400">
                              {translate("realReturn")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.projection.map((month) => (
                            <tr key={month.month} className="border-b border-gray-800/50">
                              <td className="py-2 text-white">{month.month}</td>
                              <td className="text-right py-2 text-white">
                                {formatCurrency(month.accumulatedCapital)}
                              </td>
                              <td className="text-right py-2 text-green-500">
                                +{formatCurrency(month.monthlyInterest)}
                              </td>
                              <td className="text-right py-2 text-yellow-500">
                                {formatPercent(month.estimatedInflation)}
                              </td>
                              <td
                                className={`text-right py-2 ${
                                  month.realReturn >= 0 ? "text-green-500" : "text-red-500"
                                }`}
                              >
                                {month.realReturn >= 0 ? "+" : ""}
                                {formatPercent(month.realReturn)}
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
                <TrendingUp className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">{translate("simulatorPlaceholder")}</p>
                <p className="text-gray-600 text-sm mt-2">
                  {translate("simulatorPlaceholderDesc")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
