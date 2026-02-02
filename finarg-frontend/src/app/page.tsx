'use client';

import { useQuotes, useGap } from '@/hooks/useQuotes';
import { useReserves } from '@/hooks/useReserves';
import { useArbitrage } from '@/hooks/useArbitrage';
import { useCurrentInflation } from '@/hooks/useInflation';
import { useSocialIndicators } from '@/hooks/useSocialIndicators';
import { QuoteCard } from '@/components/dashboard/QuoteCard';
import { GapGauge } from '@/components/dashboard/GapGauge';
import { ReservesWidget } from '@/components/dashboard/ReservesWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/store/useStore';
import { getCountryConfig } from '@/config/countries';
import { useTranslation } from '@/hooks/useTranslation';
import { sortQuotesByVariant } from '@/lib/utils';

export default function DashboardPage() {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryConfig = getCountryConfig(selectedCountry);
  
  const { data: quotes, isLoading: loadingQuotes } = useQuotes();
  const { data: gap, isLoading: loadingGap } = useGap();
  const { data: reserves, isLoading: loadingReserves } = useReserves(selectedCountry);
  const { data: arbitrage } = useArbitrage();
  const { data: inflation } = useCurrentInflation();
  const { data: socialIndicators } = useSocialIndicators(selectedCountry);

  const viableOpportunities = arbitrage?.filter((a) => a.viable) || [];

  if (loadingQuotes || loadingGap || (selectedCountry === 'ar' && loadingReserves)) {
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
        {sortQuotesByVariant(quotes ?? [])
          .filter((quote) => ['blue', 'oficial', 'tarjeta', 'bolsa'].includes(quote.type))
          .map((quote) => (
            <QuoteCard key={quote.type} quote={quote} country={selectedCountry} />
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {countryConfig.features.gap && gap && <GapGauge gap={gap} />}

        {selectedCountry === 'ar' && reserves && (
          <ReservesWidget
            reserves={reserves}
            label={countryConfig.reservesLabelKey ? translate(countryConfig.reservesLabelKey) : countryConfig.reservesLabel}
          />
        )}

        {selectedCountry === 'ar' && socialIndicators && (socialIndicators.minimumSalary !== undefined && socialIndicators.minimumSalary !== null || socialIndicators.minimumPension !== undefined && socialIndicators.minimumPension !== null || socialIndicators.canastaBasicaTotal !== undefined && socialIndicators.canastaBasicaTotal !== null || socialIndicators.uva !== undefined && socialIndicators.uva !== null || socialIndicators.cer !== undefined && socialIndicators.cer !== null) && (
          <div className="flex flex-col gap-4 h-full min-h-0">
            <Card className="shrink-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {translate('socialIndicators')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                {socialIndicators.minimumSalary !== undefined && socialIndicators.minimumSalary !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground">{translate('minimumSalary')}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(socialIndicators.minimumSalary)}
                    </p>
                  </div>
                )}
                {socialIndicators.minimumPension !== undefined && socialIndicators.minimumPension !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground">{translate('minimumPension')}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(socialIndicators.minimumPension)}
                    </p>
                  </div>
                )}
                {socialIndicators.canastaBasicaTotal !== undefined && socialIndicators.canastaBasicaTotal !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground">{translate('canastaBasicaTotal')}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(socialIndicators.canastaBasicaTotal)}
                    </p>
                  </div>
                )}
                {socialIndicators.uva !== undefined && socialIndicators.uva !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground">{translate('uva')}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(socialIndicators.uva)}
                    </p>
                  </div>
                )}
                {socialIndicators.cer !== undefined && socialIndicators.cer !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground">{translate('cer')}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {socialIndicators.cer.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </p>
                  </div>
                )}
              </div>
              <Link
                href="/calculadora-sueldo-neto"
                className="text-sm text-primary hover:underline mt-4 inline-block"
              >
                {translate('incomeTaxCalculator')}
              </Link>
            </CardContent>
          </Card>
            {countryConfig.features.inflation && (
              <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader className="pb-2 shrink-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {translate('monthlyInflation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-0 pb-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-red-500">
                        {inflation?.value?.toFixed(1) ?? '0'}%
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
        )}

        {countryConfig.features.inflation && selectedCountry !== 'ar' && (
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
                    {inflation?.value?.toFixed(1) ?? '0'}%
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

      {quotes && quotes.filter((q) => !['blue', 'oficial', 'tarjeta', 'bolsa'].includes(q.type)).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">{translate('otherQuotes')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sortQuotesByVariant(quotes.filter((q) => !['blue', 'oficial', 'tarjeta', 'bolsa'].includes(q.type))).map((quote) => (
              <QuoteCard key={quote.type} quote={quote} country={selectedCountry} />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {countryConfig.features.incomeTax && (
          <Link href="/calculadora-sueldo-neto">
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
          <Link href="/simulador-de-inversiones">
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
