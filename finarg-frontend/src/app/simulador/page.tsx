'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { simulatorApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart } from '@/components/charts';
import { SimulationRequest, SimulationResponse } from '@/types';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Loader2,
  PiggyBank,
  Building,
  Coins,
  Bitcoin,
} from 'lucide-react';

const INVESTMENT_TYPES = [
  { value: 'PLAZO_FIJO', label: 'Fixed Term Deposit', icon: Building, color: 'text-blue-500' },
  { value: 'PLAZO_FIJO_UVA', label: 'UVA Fixed Term', icon: TrendingUp, color: 'text-green-500' },
  { value: 'FCI_MONEY_MARKET', label: 'Money Market Fund', icon: PiggyBank, color: 'text-purple-500' },
  { value: 'CAUCION_BURSATIL', label: 'Stock Exchange Repo', icon: Coins, color: 'text-yellow-500' },
  { value: 'STABLECOIN', label: 'Stablecoin DeFi', icon: Bitcoin, color: 'text-orange-500' },
];

const TERMS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '180 days' },
  { value: 365, label: '1 year' },
];

export default function SimulatorPage() {
  const [formData, setFormData] = useState<SimulationRequest>({
    initialAmount: 1000000,
    investmentType: 'PLAZO_FIJO',
    termDays: 30,
    reinvest: true,
  });

  const [result, setResult] = useState<SimulationResponse | null>(null);

  useQuery({
    queryKey: ['rates'],
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

  const handleInputChange = (field: keyof SimulationRequest, value: SimulationRequest[keyof SimulationRequest]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  const formatUSD = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Investment Simulator</h1>
        <p className="text-gray-400 text-sm mt-1">
          Compare returns from different financial instruments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Configure Simulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Initial amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to Invest
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={formData.initialAmount || ''}
                    onChange={(e) =>
                      handleInputChange('initialAmount', parseFloat(e.target.value) || 0)
                    }
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(formData.initialAmount)}
                </p>
              </div>

              {/* Investment type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Investment Type
                </label>
                <div className="space-y-2">
                  {INVESTMENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('investmentType', type.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          formData.investmentType === type.value
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${type.color}`} />
                        <span className="text-sm text-white">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
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
                      variant={formData.termDays === term.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleInputChange('termDays', term.value)}
                    >
                      {term.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reinvest */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="reinvest"
                  checked={formData.reinvest}
                  onChange={(e) => handleInputChange('reinvest', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary"
                />
                <label htmlFor="reinvest" className="text-sm text-gray-300">
                  Reinvest interest (compound interest)
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
                    Simulating...
                  </>
                ) : (
                  'Simulate Investment'
                )}
              </Button>
            </form>
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
                    <p className="text-xs text-gray-400">ARS Profit</p>
                    <p className="text-xl font-bold text-green-500 mt-1">
                      +{formatCurrency(result.profitARS)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">Nominal Return</p>
                    <p className="text-xl font-bold text-primary mt-1">
                      {formatPercent(result.nominalReturn)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">Real Return</p>
                    <p
                      className={`text-xl font-bold mt-1 ${
                        result.realReturn >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {result.realReturn >= 0 ? '+' : ''}
                      {formatPercent(result.realReturn)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Details and rates */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Simulation Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">TNA</p>
                      <p className="text-lg font-semibold text-white">
                        {formatPercent(result.rateTNA)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">TEA</p>
                      <p className="text-lg font-semibold text-white">
                        {formatPercent(result.rateTEA)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">USD Profit (estimated)</p>
                      <p className="text-lg font-semibold text-green-500">
                        {formatUSD(result.profitUSD)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">USD Return</p>
                      <p
                        className={`text-lg font-semibold ${
                          result.dollarReturn >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {result.dollarReturn >= 0 ? '+' : ''}
                        {formatPercent(result.dollarReturn)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projection chart */}
              {result.projection && result.projection.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Capital Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={result.projection.map((p) => ({
                        mes: `Month ${p.month}`,
                        capital: p.accumulatedCapital,
                        rendimientoReal: p.realReturn,
                      }))}
                      xKey="mes"
                      yKey={['capital']}
                      colors={['#10b981']}
                      height={250}
                      formatY={(v) => `$${(v / 1000000).toFixed(2)}M`}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Monthly projection table */}
              {result.projection && result.projection.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-2 text-gray-400">Month</th>
                            <th className="text-right py-2 text-gray-400">Capital</th>
                            <th className="text-right py-2 text-gray-400">Interest</th>
                            <th className="text-right py-2 text-gray-400">Est. Inflation</th>
                            <th className="text-right py-2 text-gray-400">Real Return</th>
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
                                  month.realReturn >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}
                              >
                                {month.realReturn >= 0 ? '+' : ''}
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
                <p className="text-gray-500">
                  Configure the parameters and simulate your investment
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Compare fixed terms, funds, stablecoins and more
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
