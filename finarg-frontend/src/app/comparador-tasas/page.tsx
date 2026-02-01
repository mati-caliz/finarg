'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ratesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  Landmark,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/store/useStore';
import { QueryError } from '@/components/QueryError';
import { Skeleton } from '@/components/ui/skeleton';

type TabType = 'wallets' | 'banks';

function extractDomainFromFaviconUrl(url: string): string | null {
  const domainMatch = url.match(/[?&]domain=([^&]+)/);
  if (domainMatch) {
    return domainMatch[1];
  }
  
  const urlMatch = url.match(/[?&]url=https?:\/\/([^&/]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  return null;
}

function getFallbackLogoUrl(domain: string): string {
  return `https://icon.horse/icon/${domain}`;
}

interface RateDTO {
  id: string;
  name: string;
  tna: number;
  tea?: number;
  product?: string;
  term?: string;
  date?: string;
  limit?: number;
  logo?: string;
  link?: string;
}

export default function RatesPage() {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const [activeTab, setActiveTab] = useState<TabType>('wallets');

  const formatPercent = (value: number) =>
    `${Number(value).toFixed(1)}%`;

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) {return null;}
    const [y, m, d] = dateStr.split('-');
    return d && m && y ? `${d}/${m}/${y}` : dateStr;
  };

  const formatLimit = (limit: number | undefined) => {
    if (limit === undefined || limit === null || limit <= 0) {return null;}
    if (limit >= 1_000_000) {return `$${(limit / 1_000_000).toFixed(0)} M`;}
    if (limit >= 1_000) {return `$${(limit / 1_000).toFixed(0)} K`;}
    return `$${limit}`;
  };

  const {
    data: bankRates = [],
    isLoading: banksLoading,
    isError: banksError,
    error: banksErrorData,
    refetch: refetchBanks,
  } = useQuery({
    queryKey: ['rates', 'fixed-term', selectedCountry],
    queryFn: async () => {
      const res = await ratesApi.getFixedTerm(selectedCountry);
      return (res.data as RateDTO[]) ?? [];
    },
    enabled: selectedCountry === 'ar',
  });

  const {
    data: walletRates = [],
    isLoading: walletsLoading,
    isError: walletsError,
    error: walletsErrorData,
    refetch: refetchWallets,
  } = useQuery({
    queryKey: ['rates', 'wallets', selectedCountry],
    queryFn: async () => {
      const res = await ratesApi.getWallets(selectedCountry);
      return (res.data as RateDTO[]) ?? [];
    },
    enabled: selectedCountry === 'ar',
  });

  const showWallets = selectedCountry === 'ar';
  const showBanks = selectedCountry === 'ar';

  const maxBankTna = bankRates.length > 0
    ? Math.max(...bankRates.map((r) => r.tna))
    : 0;
  const maxWalletTna = walletRates.length > 0
    ? Math.max(...walletRates.map((r) => r.tna))
    : 0;

  if (!showWallets && !showBanks) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translate('ratesComparator')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {translate('ratesComparatorDesc')}
          </p>
        </div>
        <Card className="bg-card">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {translate('ratesNotAvailableCountry')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translate('ratesComparator')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {translate('ratesComparatorDesc')}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            {translate('ratesUpdateNote')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {showWallets && (
          <Button
            variant={activeTab === 'wallets' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('wallets')}
            className="flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            {translate('walletRates')}
          </Button>
        )}
        {showBanks && (
          <Button
            variant={activeTab === 'banks' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('banks')}
            className="flex items-center gap-2"
          >
            <Landmark className="h-4 w-4" />
            {translate('fixedTermRates')}
          </Button>
        )}
      </div>

      {activeTab === 'wallets' && showWallets && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-primary" />
              {translate('walletTnaRates')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {translate('walletRatesDisclaimer')}
            </p>
          </CardHeader>
          <CardContent>
            {walletsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : walletsError ? (
              <QueryError
                error={walletsErrorData as Error}
                onRetry={() => refetchWallets()}
                compact
              />
            ) : walletRates.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {translate('noWalletRates')}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {walletRates.map((row) => {
                  const isHighest = row.tna >= maxWalletTna && maxWalletTna > 0;
                  const limitStr = formatLimit(row.limit);
                  return (
                    <Card
                      key={row.id}
                      className={`overflow-hidden transition-colors ${
                        isHighest ? 'border-primary/50 bg-primary/5' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 gap-3">
                            <div className="rate-logo flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/50 p-1.5">
                              {row.logo ? (
                                <>
                                  <img
                                    src={row.logo}
                                    alt=""
                                    className="rate-logo-img max-h-full max-w-full shrink-0 object-contain object-center"
                                    loading="lazy"
                                    onError={(e) => {
                                      const img = e.currentTarget;
                                      const domain = extractDomainFromFaviconUrl(row.logo ?? '');
                                      if (domain && !img.dataset.triedFallback) {
                                        img.dataset.triedFallback = 'true';
                                        img.src = getFallbackLogoUrl(domain);
                                      } else {
                                        img.style.display = 'none';
                                        const fallback = img.nextElementSibling;
                                        if (fallback instanceof HTMLElement) {
                                          fallback.className = 'rate-logo-fallback flex h-full w-full items-center justify-center';
                                        }
                                      }
                                    }}
                                  />
                                  <span className="rate-logo-fallback hidden h-full w-full items-center justify-center">
                                    <Wallet className="h-6 w-6 text-muted-foreground" />
                                  </span>
                                </>
                              ) : (
                                <Wallet className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-foreground">
                                  {row.name}
                                </span>
                                {isHighest && (
                                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                                    {translate('highest')}
                                  </span>
                                )}
                              </div>
                              {row.product && (
                                <div className="mt-1 max-h-20 overflow-y-auto overscroll-contain">
                                  <p className="text-xs text-muted-foreground leading-relaxed pr-1">
                                    {row.product}
                                  </p>
                                </div>
                              )}
                              <div className="mt-2 flex flex-wrap gap-1">
                                <span className="rounded border border-border px-2 py-0.5 text-xs">
                                  {translate('wallet')}
                                </span>
                                {limitStr ? (
                                  <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                                    {translate('limitLabel')}: {limitStr}
                                  </span>
                                ) : (
                                  <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                                    {translate('noLimit')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end">
                            <span className="text-2xl font-bold text-primary">
                              {row.tna > 0 ? formatPercent(row.tna) : '-'}
                            </span>
                            <span className="text-xs text-muted-foreground">TNA</span>
                            {row.tea !== undefined && row.tea !== null && (
                              <span className="mt-1 text-sm text-muted-foreground">
                                TEA {formatPercent(row.tea)}
                              </span>
                            )}
                            {row.date && (
                              <div className="mt-1 text-xs text-muted-foreground text-right leading-tight">
                                <span className="block">{translate('tnaValidSince')}</span>
                                <span className="block">{formatDate(row.date)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'banks' && showBanks && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Landmark className="h-5 w-5 text-primary" />
              {translate('fixedTermBankRates')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {translate('fixedTermRatesDisclaimer')}
            </p>
          </CardHeader>
          <CardContent>
            {banksLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : banksError ? (
              <QueryError
                error={banksErrorData as Error}
                onRetry={() => refetchBanks()}
                compact
              />
            ) : bankRates.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {translate('noBankRates')}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bankRates.map((row) => {
                  const isHighest = row.tna >= maxBankTna && maxBankTna > 0;
                  return (
                    <Card
                      key={row.id}
                      className={`overflow-hidden transition-colors ${
                        isHighest ? 'border-primary/50 bg-primary/5' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 gap-3">
                            <div className="rate-logo flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/50 p-1.5">
                              {row.logo ? (
                                <>
                                  <img
                                    src={row.logo}
                                    alt=""
                                    className="rate-logo-img max-h-full max-w-full shrink-0 object-contain object-center"
                                    loading="lazy"
                                    onError={(e) => {
                                      const img = e.currentTarget;
                                      const domain = extractDomainFromFaviconUrl(row.logo ?? '');
                                      if (domain && !img.dataset.triedFallback) {
                                        img.dataset.triedFallback = 'true';
                                        img.src = getFallbackLogoUrl(domain);
                                      } else {
                                        img.style.display = 'none';
                                        const fallback = img.nextElementSibling;
                                        if (fallback instanceof HTMLElement) {
                                          fallback.className = 'rate-logo-fallback flex h-full w-full items-center justify-center';
                                        }
                                      }
                                    }}
                                  />
                                  <span className="rate-logo-fallback hidden h-full w-full items-center justify-center">
                                    <Landmark className="h-6 w-6 text-muted-foreground" />
                                  </span>
                                </>
                              ) : (
                                <Landmark className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-foreground">
                                  {row.name}
                                </span>
                                {isHighest && (
                                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                                    {translate('highest')}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                <span className="rounded border border-border px-2 py-0.5 text-xs">
                                  {row.term ?? '30 días'}
                                </span>
                              </div>
                              {row.link && (
                                <a
                                  href={row.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {translate('seeMore')}
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end">
                            <span className="text-2xl font-bold text-primary">
                              {formatPercent(row.tna)}
                            </span>
                            <span className="text-xs text-muted-foreground">TNA</span>
                            {row.tea !== undefined && row.tea !== null && (
                              <span className="mt-1 text-sm text-muted-foreground">
                                TEA {formatPercent(row.tea)}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-500 font-medium mb-1">{translate('importantInfo')}</p>
              <p className="text-muted-foreground">
                {translate('ratesDisclaimer')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
