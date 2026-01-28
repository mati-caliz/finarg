'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart } from '@/components/charts';
import { Quote } from '@/types';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { QueryError } from '@/components/QueryError';
import { DolarCardSkeleton } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/useStore';
import { getCountryConfig } from '@/config/countries';
import { formatCurrencySimple } from '@/lib/utils';

const PERIODS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '3 months' },
  { value: '180', label: '6 months' },
  { value: '365', label: '1 year' },
];

export default function QuotesPage() {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryConfig = getCountryConfig(selectedCountry);
  
  const currencyTypes = useMemo(() => 
    countryConfig.currencyTypes.map(t => ({ value: t.code, label: t.name })),
    [countryConfig]
  );
  
  const [selectedType, setSelectedType] = useState(currencyTypes[0]?.value || '');
  const [period, setPeriod] = useState('30');

  const {
    data: quotes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['quotes', selectedCountry],
    queryFn: async () => {
      const response = await quotesApi.getAllByCountry(selectedCountry);
      return response.data as Quote[];
    },
    refetchInterval: 60000,
  });

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    error: historyErrorData,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['history', selectedCountry, selectedType, period],
    queryFn: async () => {
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const response = await quotesApi.getHistory(selectedType, from, to);
      return response.data;
    },
    enabled: !!selectedType,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(countryConfig.locale, { day: '2-digit', month: 'short' });
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {countryConfig.flag} Quotes - {countryConfig.name}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            All quotes in real-time
          </p>
        </div>
        <QueryError
          error={error as Error}
          onRetry={() => refetch()}
          title="Error loading quotes"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {countryConfig.flag} Quotes - {countryConfig.name}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            All quotes in real-time ({countryConfig.localCurrency}/USD)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: currencyTypes.length || 4 }).map((_, i) => <DolarCardSkeleton key={i} />)
        ) : (
          quotes?.map((quote) => (
            <Card
              key={quote.type}
              className={`bg-card cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                selectedType === quote.type ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedType(quote.type)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-400">{quote.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Spread: {formatCurrencySimple(quote.spread, selectedCountry)}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      quote.variation >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {quote.variation >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(quote.variation).toFixed(2)}%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Buy</p>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrencySimple(quote.buy, selectedCountry)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sell</p>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrencySimple(quote.sell, selectedCountry)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  {new Date(quote.lastUpdate).toLocaleString(countryConfig.locale)}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="bg-card">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">
              History - {currencyTypes.find((t) => t.value === selectedType)?.label || selectedType}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <Button
                  key={p.value}
                  variant={period === p.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          ) : historyError ? (
            <QueryError
              error={historyErrorData as Error}
              onRetry={() => refetchHistory()}
              compact
            />
          ) : history && history.length > 0 ? (
            <LineChart
              data={history}
              xKey="date"
              yKey={['buy', 'sell']}
              colors={['#3b82f6', '#10b981']}
              height={300}
              formatX={formatDate}
              formatY={(v) => `${countryConfig.currencySymbol}${v.toLocaleString(countryConfig.locale)}`}
              showLegend
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No historical data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Quotes Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: currencyTypes.length || 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Buy</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Sell</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Spread</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Variation</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes?.map((quote) => (
                    <tr
                      key={quote.type}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-white">{quote.name}</span>
                      </td>
                      <td className="text-right py-3 px-4 text-white">
                        {formatCurrencySimple(quote.buy, selectedCountry)}
                      </td>
                      <td className="text-right py-3 px-4 text-white">
                        {formatCurrencySimple(quote.sell, selectedCountry)}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-400">
                        {formatCurrencySimple(quote.spread, selectedCountry)}
                      </td>
                      <td
                        className={`text-right py-3 px-4 ${
                          quote.variation >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {quote.variation >= 0 ? '+' : ''}
                        {quote.variation.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
