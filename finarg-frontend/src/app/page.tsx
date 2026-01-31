'use client';

import { useQuotes, useGap } from '@/hooks/useQuotes';
import { useReserves } from '@/hooks/useReserves';
import { useArbitrage } from '@/hooks/useArbitrage';
import { useCurrentInflation } from '@/hooks/useInflation';
import { QuoteCard } from '@/components/dashboard/QuoteCard';
import { GapGauge } from '@/components/dashboard/GapGauge';
import { ReservesWidget } from '@/components/dashboard/ReservesWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/store/useStore';
import { getCountryConfig } from '@/config/countries';
import { useTranslation } from '@/hooks/useTranslation';

export default function DashboardPage() {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryConfig = getCountryConfig(selectedCountry);
  
  const { data: quotes, isLoading: loadingQuotes } = useQuotes();
  const { data: gap, isLoading: loadingGap } = useGap();
  const { data: reserves, isLoading: loadingReserves } = useReserves();
  const { data: arbitrage } = useArbitrage();
  const { data: inflation } = useCurrentInflation();

  const viableOpportunities = arbitrage?.filter((a) => a.viable) || [];

  if (loadingQuotes || loadingGap || loadingReserves) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{translate('dashboard')}</h1>
        <p className="text-muted-foreground">
          {countryConfig.flag} {translate('marketSummary')} - {translate(selectedCountry)}
        </p>
      </div>

      {countryConfig.features.arbitrage && viableOpportunities.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-4 w-4" />
              {translate('arbitrageDetected')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {viableOpportunities.slice(0, 3).map((op, i) => (
                <Link
                  key={i}
                  href="/arbitraje"
                  className="text-sm bg-yellow-500/20 px-3 py-1 rounded-full hover:bg-yellow-500/30 transition-colors"
                >
                  {op.description} ({op.spreadPercentage.toFixed(2)}%)
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quotes?.slice(0, 4).map((quote) => (
          <QuoteCard key={quote.type} quote={quote} country={selectedCountry} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {countryConfig.features.gap && gap && <GapGauge gap={gap} />}

        {countryConfig.features.reserves && reserves && (
          <ReservesWidget reserves={reserves} label={countryConfig.reservesLabel} />
        )}

        {countryConfig.features.inflation && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {translate('monthlyInflation')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-500">
                    {inflation?.value?.toFixed(1) || '0'}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {translate('last12Months')}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500/50" />
              </div>
              <Link
                href="/inflacion"
                className="text-sm text-primary hover:underline mt-4 inline-block"
              >
                {translate('viewHistory')}
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {quotes && quotes.length > 4 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">{translate('otherQuotes')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quotes.slice(4).map((quote) => (
              <QuoteCard key={quote.type} quote={quote} country={selectedCountry} />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {countryConfig.features.incomeTax && (
          <Link href="/ganancias">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <p className="font-medium">{translate('incomeTaxCalculator')}</p>
                <p className="text-sm text-muted-foreground">
                  {translate('incomeTaxSubtitle')}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        {countryConfig.features.simulator && (
          <Link href="/simulador">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <p className="font-medium">{translate('investmentSimulator')}</p>
                <p className="text-sm text-muted-foreground">
                  {translate('compareReturns')}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        {countryConfig.features.inflation && (
          <Link href="/inflacion">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <p className="font-medium">{translate('adjustmentCalculator')}</p>
                <p className="text-sm text-muted-foreground">
                  {translate('updateValues')}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        {countryConfig.features.repos && (
          <Link href="/cauciones">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <p className="font-medium">{translate('repoOptimizer')}</p>
                <p className="text-sm text-muted-foreground">
                  {translate('maximizeReturns')}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
