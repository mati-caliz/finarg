"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { ratesApi } from "@/lib/api";
import { formatPercent } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Home, Landmark, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";

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
  isBestRate?: boolean;
}

export function TopRatesWidget() {
  const { translate } = useTranslation();

  const { data: wallets, isLoading: loadingWallets } = useQuery({
    queryKey: ["rates", "wallets", "ar"],
    queryFn: async () => {
      const response = await ratesApi.getWallets("ar");
      return (response.data as RateDTO[]) ?? [];
    },
    staleTime: 300000,
  });

  const { data: banks, isLoading: loadingBanks } = useQuery({
    queryKey: ["rates", "fixed-term", "ar"],
    queryFn: async () => {
      const response = await ratesApi.getFixedTerm("ar");
      return (response.data as RateDTO[]) ?? [];
    },
    staleTime: 300000,
  });

  const { data: mortgages, isLoading: loadingMortgages } = useQuery({
    queryKey: ["rates", "uva-mortgages", "ar"],
    queryFn: async () => {
      const response = await ratesApi.getUvaMortgages("ar");
      return (response.data as RateDTO[]) ?? [];
    },
    staleTime: 300000,
  });

  const topWallets = wallets?.sort((a, b) => b.tna - a.tna).slice(0, 2);

  const topBanks = banks?.sort((a, b) => b.tna - a.tna).slice(0, 2);

  const bestMortgages = mortgages?.sort((a, b) => a.tna - b.tna).slice(0, 2);

  const isLoading = loadingWallets || loadingBanks || loadingMortgages;

  if (isLoading) {
    return <Skeleton className="h-[420px] w-full rounded-xl" />;
  }

  return (
    <Card className="border-t-[3px] border-t-emerald-400 min-h-[420px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            {translate("bestRates")}
          </CardTitle>
          <Link
            href="/comparador-tasas"
            className="text-xs text-success-accessible hover:underline flex items-center gap-1"
          >
            {translate("seeAll")}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {topWallets && topWallets.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-500" />
              <h3 className="text-xs font-semibold text-muted-foreground">
                {translate("virtualWallets")}
              </h3>
            </div>
            <div className="space-y-2">
              {topWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{wallet.name}</p>
                    {wallet.product && (
                      <p className="text-xs text-muted-foreground truncate">{wallet.product}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                      {formatPercent(wallet.tna)}
                    </p>
                    <p className="text-xs text-muted-foreground">TNA</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topBanks && topBanks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-semibold text-muted-foreground">
                {translate("fixedTermDeposits")}
              </h3>
            </div>
            <div className="space-y-2">
              {topBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{bank.name}</p>
                    {bank.term && (
                      <p className="text-xs text-muted-foreground truncate">{bank.term}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPercent(bank.tna)}
                    </p>
                    <p className="text-xs text-muted-foreground">TNA</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bestMortgages && bestMortgages.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-violet-500" />
              <h3 className="text-xs font-semibold text-muted-foreground">
                {translate("uvaMortgages")}
              </h3>
            </div>
            <div className="space-y-2">
              {bestMortgages.map((mortgage) => (
                <div
                  key={mortgage.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-violet-500/5 border border-violet-500/10 hover:bg-violet-500/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{mortgage.name}</p>
                    {mortgage.product && (
                      <p className="text-xs text-muted-foreground truncate">{mortgage.product}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-base font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                      <TrendingDown className="h-3.5 w-3.5" />
                      {formatPercent(mortgage.tna)}
                    </p>
                    <p className="text-xs text-muted-foreground">TNA</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
