'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reposApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart } from '@/components/charts';
import {
  Coins,
  DollarSign,
  Calendar,
  Calculator,
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

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

const TERMS = [
  { value: 1, label: '1 day' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
];

export default function ReposPage() {
  const [amount, setAmount] = useState<number>(1000000);
  const [termDays, setTermDays] = useState<number>(7);
  const [result, setResult] = useState<RepoResult | null>(null);

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
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Repo Optimizer</h1>
        <p className="text-gray-400 text-sm mt-1">
          Find the best stock exchange repo strategy for your capital
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-primary" />
              Configure Repo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to Invest
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(amount)}</p>
              </div>

              {/* Term */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  Term
                </label>
                <div className="flex flex-wrap gap-2">
                  {TERMS.map((term) => (
                    <Button
                      key={term.value}
                      type="button"
                      variant={termDays === term.value ? 'default' : 'outline'}
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
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Optimize Repo
                  </>
                )}
              </Button>
            </form>

            {/* Info about repos */}
            <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">What is a repo?</h4>
              <p className="text-xs text-gray-400">
                A stock exchange repo is a short-term loan where your money is guaranteed
                by securities. It is a fixed income option with daily liquidity and
                competitive rates.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              {/* Main KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">Final Amount</p>
                    <p className="text-xl font-bold text-white mt-1">
                      {formatCurrency(result.finalAmount)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">Gross Profit</p>
                    <p className="text-xl font-bold text-green-500 mt-1">
                      +{formatCurrency(result.profitARS)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">TNA</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      {formatPercent(result.rateTNA)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">TEA</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      {formatPercent(result.rateTEA)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detail */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Operation Detail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Initial Amount</span>
                        <span className="text-white">{formatCurrency(result.initialAmount)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Term</span>
                        <span className="text-white">{result.termDays} days</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Total Return</span>
                        <span className="text-green-500">
                          +{formatPercent(result.totalReturn)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Est. Commission</span>
                        <span className="text-red-500">
                          -{formatCurrency(result.estimatedCommission)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Net Return</span>
                        <span className="text-green-500">
                          {formatPercent(result.netReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-white font-medium">Final Amount</span>
                        <span className="text-primary font-bold">
                          {formatCurrency(result.finalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Optimal strategy */}
                  {result.optimalStrategy && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-primary">Optimal Strategy</p>
                          <p className="text-sm text-gray-300 mt-1">{result.optimalStrategy}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Term comparison */}
              {result.comparison && result.comparison.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Term Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={result.comparison.map((c) => ({
                        plazo: `${c.term}d`,
                        tasaTNA: c.rateTNA,
                        rendimiento: c.returnRate,
                      }))}
                      xKey="plazo"
                      yKey={['tasaTNA']}
                      colors={['#10b981']}
                      height={200}
                      formatY={(v) => `${v.toFixed(1)}%`}
                    />

                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-2 text-gray-400">Term</th>
                            <th className="text-right py-2 text-gray-400">TNA</th>
                            <th className="text-right py-2 text-gray-400">Final Amount</th>
                            <th className="text-right py-2 text-gray-400">Return</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.comparison.map((comp) => (
                            <tr
                              key={comp.term}
                              className={`border-b border-gray-800/50 ${
                                comp.term === result.termDays ? 'bg-primary/5' : ''
                              }`}
                            >
                              <td className="py-2 text-white">
                                {comp.term} days
                                {comp.term === result.termDays && (
                                  <span className="ml-2 text-xs text-primary">(selected)</span>
                                )}
                              </td>
                              <td className="text-right py-2 text-primary">
                                {formatPercent(comp.rateTNA)}
                              </td>
                              <td className="text-right py-2 text-white">
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

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
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
                <Coins className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">Configure the parameters to optimize your repo</p>
                <p className="text-gray-600 text-sm mt-2">
                  Compare rates and terms to maximize your return
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-500 font-medium mb-1">Important information</p>
              <p className="text-gray-400">
                Repo rates are indicative and may vary according to market conditions
                and your broker. Estimated commissions are approximate and depend on the
                intermediary. Always verify the conditions before trading.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
