'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { inflationApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart } from '@/components/charts';
import { Inflation, InflationAdjustment } from '@/types';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Calculator,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function InflationPage() {
  const { translate } = useTranslation();
  const [originalAmount, setOriginalAmount] = useState<number>(100000);
  const [startDate, setStartDate] = useState<string>('2023-01-01');
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [adjustmentResult, setAdjustmentResult] = useState<InflationAdjustment | null>(null);

  const { data: currentInflation } = useQuery({
    queryKey: ['inflation-current'],
    queryFn: async () => {
      const response = await inflationApi.getCurrent();
      return response.data as Inflation;
    },
  });

  const { data: monthlyInflation } = useQuery({
    queryKey: ['inflation-monthly'],
    queryFn: async () => {
      const response = await inflationApi.getMonthly(24);
      return response.data as Inflation[];
    },
  });

  useQuery({
    queryKey: ['inflation-year-over-year'],
    queryFn: async () => {
      const response = await inflationApi.getYearOverYear();
      return response.data;
    },
  });

  const adjustMutation = useMutation({
    mutationFn: async () => {
      const response = await inflationApi.adjust(originalAmount, startDate, endDate);
      return response.data as InflationAdjustment;
    },
    onSuccess: (data) => {
      setAdjustmentResult(data);
    },
  });

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    adjustMutation.mutate();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  const formatPercent = (value: number | string) => `${Number(value).toFixed(2)}%`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{translate('inflationTitle')}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {translate('inflationDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{translate('monthlyInflation')}</p>
                <p className="text-2xl font-bold text-foreground mt-1 min-h-[2rem] flex items-center">
                  {currentInflation ? formatPercent(currentInflation.value) : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
                  {currentInflation?.date
                    ? new Date(currentInflation.date).toLocaleDateString('es-AR', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : ''}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{translate('yearOverYear')}</p>
                <p className="text-2xl font-bold text-red-500 mt-1 min-h-[2rem] flex items-center">
                  {currentInflation?.yearOverYear ? formatPercent(currentInflation.yearOverYear) : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
                  {translate('last12Months')}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg shrink-0">
                <BarChart3 className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{translate('yearToDate')}</p>
                <p className="text-2xl font-bold text-yellow-500 mt-1 min-h-[2rem] flex items-center">
                  {currentInflation?.yearToDate
                    ? formatPercent(currentInflation.yearToDate)
                    : '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
                  {translate('sinceJan')} {new Date().getFullYear()}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg shrink-0">
                <Calendar className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              {translate('adjustmentCalculator')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {translate('originalAmount')}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="100000"
                    value={originalAmount || ''}
                    onChange={(e) => setOriginalAmount(parseFloat(e.target.value) || 0)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{translate('startDate')}</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {translate('endDate')}
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
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
                    {translate('calculating')}
                  </>
                ) : (
                  translate('calculateAdjustment')
                )}
              </Button>
            </form>

            {adjustmentResult && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">{translate('originalAmount')}</span>
                    <span className="text-white">{formatCurrency(adjustmentResult.originalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">{translate('monthsElapsed')}</span>
                    <span className="text-white">{adjustmentResult.monthsElapsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">{translate('cumulativeInflation')}</span>
                    <span className="text-red-500">
                      +{formatPercent(adjustmentResult.accumulatedInflation)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{translate('adjustedAmount')}</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(adjustmentResult.adjustedAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {translate('maintainPurchasingPower')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">{translate('monthlyEvolution')} (24m)</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyInflation && monthlyInflation.length > 0 ? (
                <BarChart
                  data={monthlyInflation.map((i) => ({
                    fecha: formatDate(i.date),
                    valor: i.value,
                  }))}
                  xKey="fecha"
                  yKey="valor"
                  color="#10b981"
                  height={250}
                  formatY={(v) => `${Number(v).toFixed(1)}%`}
                />
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500">
                  Loading data...
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">{translate('monthlyData')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 text-gray-400">{translate('period')}</th>
                      <th className="text-right py-2 text-gray-400">{translate('monthly')}</th>
                      <th className="text-right py-2 text-gray-400">{translate('yearOverYear')}</th>
                      <th className="text-right py-2 text-gray-400">{translate('yearToDate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyInflation?.map((inflation, index) => (
                      <tr key={index} className="border-b border-gray-800/50">
                        <td className="py-2 text-white">
                          {new Date(inflation.date).toLocaleDateString('es-AR', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="text-right py-2 text-white">
                          {formatPercent(inflation.value)}
                        </td>
                        <td className="text-right py-2 text-red-500">
                          {inflation.yearOverYear ? formatPercent(inflation.yearOverYear) : '-'}
                        </td>
                        <td className="text-right py-2 text-yellow-500">
                          {inflation.yearToDate ? formatPercent(inflation.yearToDate) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
