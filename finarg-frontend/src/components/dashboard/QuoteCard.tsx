'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencySimple } from '@/lib/utils';
import { Quote } from '@/types';
import { useAppStore } from '@/store/useStore';
import { CountryCode } from '@/config/countries';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n/translations';

export interface QuoteCardProps {
  quote: Quote;
  country?: CountryCode;
}

export function QuoteCard({ quote, country }: QuoteCardProps) {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || (quote.country as CountryCode) || selectedCountry;
  
  const variation = quote.variation || 0;
  const isPositive = variation > 0;
  const isNegative = variation < 0;

  const translated = translate(quote.type as TranslationKey);
  const displayName = translated === quote.type ? quote.name : translated;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {displayName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{formatCurrencySimple(quote.sell, countryToUse)}</p>
            <p className="text-xs text-muted-foreground">
              {translate('buy')}: {formatCurrencySimple(quote.buy, countryToUse)}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 text-sm ${
              isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : isNegative ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
            <span>{variation.toFixed(2)}%</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {translate('spread')}: {formatCurrencySimple(quote.spread, countryToUse)}
        </div>
      </CardContent>
    </Card>
  );
}
