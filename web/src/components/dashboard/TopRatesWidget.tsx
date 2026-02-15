"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { ratesApi } from "@/lib/api";
import { CACHE_TIMES } from "@/lib/constants";
import { formatPercent } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Landmark, TrendingUp, Wallet } from "lucide-react";
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

export function TopInvestmentRatesWidget() {
  const { translate } = useTranslation();

  const { data: topRates, isLoading } = useQuery({
    queryKey: ["rates", "top-investment", "ar"],
    queryFn: async () => {
      const response = await ratesApi.getTopInvestment("ar", 2);
      return (response.data as RateDTO[]) ?? [];
    },
    staleTime: CACHE_TIMES.REALTIME_STALE,
  });

  const topWallets = topRates?.filter((r) => !r.term).slice(0, 2);
  const topBanks = topRates?.filter((r) => !!r.term).slice(0, 2);

  if (isLoading) {
    return <Skeleton className="h-[260px] w-full rounded-xl" />;
  }

  return (
    <Card className="border-t-[3px] border-t-emerald-400 min-h-[260px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            {translate("bestInvestments")}
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
      <CardContent className="space-y-3">
        {topWallets && topWallets.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-blue-500" />
              <h3 className="text-xs font-medium text-muted-foreground">
                {translate("virtualWallets")}
              </h3>
            </div>
            <div className="space-y-1.5">
              {topWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between p-1.5 rounded-md bg-blue-500/5 border border-blue-500/10"
                >
                  <p className="text-sm font-medium text-foreground truncate flex-1 min-w-0">
                    {wallet.name}
                  </p>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400 ml-2 shrink-0">
                    {formatPercent(wallet.tna)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {topBanks && topBanks.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5 text-emerald-500" />
              <h3 className="text-xs font-medium text-muted-foreground">
                {translate("fixedTermDeposits")}
              </h3>
            </div>
            <div className="space-y-1.5">
              {topBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-between p-1.5 rounded-md bg-emerald-500/5 border border-emerald-500/10"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{bank.name}</p>
                    {bank.term && (
                      <p className="text-xs text-muted-foreground truncate">{bank.term}</p>
                    )}
                  </div>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 ml-2 shrink-0">
                    {formatPercent(bank.tna)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
