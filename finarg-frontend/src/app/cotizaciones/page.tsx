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
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n/translations';

export default function QuotesPage() {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryConfig = getCountryConfig(selectedCountry);
  const { translate } = useTranslation();
  
  const currencyTypes = useMemo(() => 
    countryConfig.currencyTypes.map(tType => ({ 
      value: tType.code, 
      label: translate(tType.code as TranslationKey)
    })),
    [countryConfig, translate]
  );
  
  const periods = useMemo(() => [
    { value: '7', label: translate('days7') },
    { value: '30', label: translate('days30') },
    { value: '90', label: translate('months3') },
    { value: '180', label: translate('months6') },
    { value: '365', label: translate('year1') },
    { value: '730', label: translate('year2') },
    { value: '1095', label: translate('year3') },
    { value: '1825', label: translate('year5') },
    { value: '3650', label: translate('year10') },
    { value: '5500', label: translate('max') },
  ], [translate]);
  
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
      const response = await quotesApi.getHistory(selectedType, from, to, selectedCountry);
      return response.data;
    },
    enabled: !!selectedType,
  });

  const formatDate = (value: string | number) => {
    const date = new Date(value);
    return date.toLocaleDateString(countryConfig.locale, { day: '2-digit', month: 'short' });
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {countryConfig.flag} {translate('quotes')} - {translate(countryConfig.code as TranslationKey)}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {translate('allQuotesRealTime')}
          </p>
        </div>
        <QueryError
          error={error as Error}
          onRetry={() => refetch()}
          title={translate('errorLoadingQuotes')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {countryConfig.flag} {translate('quotes')} - {translate(countryConfig.code as TranslationKey)}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {translate('allQuotesRealTime')} ({countryConfig.localCurrency}/USD)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {translate('refresh')}
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
                    <p className="text-sm text-muted-foreground">{translate(quote.type as TranslationKey)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {translate('spread')}: {formatCurrencySimple(quote.spread, selectedCountry)}
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
                    <p className="text-xs text-muted-foreground">{translate('buy')}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrencySimple(quote.buy, selectedCountry)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{translate('sell')}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrencySimple(quote.sell, selectedCountry)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {new Date(quote.lastUpdate).toLocaleString(countryConfig.locale)}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="bg-card">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg">
                {translate('history')} - {currencyTypes.find((t) => t.value === selectedType)?.label || selectedType}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {periods.map((p) => (
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
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {currencyTypes.map((t) => (
                <Button
                  key={t.value}
                  variant={selectedType === t.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(t.value)}
                >
                  {t.label}
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
              height={320}
              formatX={formatDate}
              formatY={(v) => `${countryConfig.currencySymbol}${v.toLocaleString(countryConfig.locale)}`}
              showLegend
              showGrid={false}
              legendLabels={{ buy: translate('buy'), sell: translate('sell') }}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {translate('noHistoricalData')}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">{translate('quotesComparison')}</CardTitle>
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
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{translate('type')}</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">{translate('buy')}</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">{translate('sell')}</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">{translate('spread')}</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">{translate('variation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes?.map((quote) => (
                    <tr
                      key={quote.type}
                      className="border-b border-border/50 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{translate(quote.type as TranslationKey)}</span>
                      </td>
                      <td className="text-right py-3 px-4 text-foreground">
                        {formatCurrencySimple(quote.buy, selectedCountry)}
                      </td>
                      <td className="text-right py-3 px-4 text-foreground">
                        {formatCurrencySimple(quote.sell, selectedCountry)}
                      </td>
                      <td className="text-right py-3 px-4 text-muted-foreground">
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
