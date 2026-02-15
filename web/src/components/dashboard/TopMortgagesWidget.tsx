"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { ratesApi } from "@/lib/api";
import { CACHE_TIMES } from "@/lib/constants";
import { formatPercent } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Home, TrendingDown } from "lucide-react";
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

export function TopMortgagesWidget() {
  const { translate } = useTranslation();

  const { data: bestMortgages, isLoading } = useQuery({
    queryKey: ["rates", "top-mortgages", "ar"],
    queryFn: async () => {
      const response = await ratesApi.getTopMortgages("ar", 2);
      return (response.data as RateDTO[]) ?? [];
    },
    staleTime: CACHE_TIMES.REALTIME_STALE,
  });

  if (isLoading) {
    return <Skeleton className="h-[180px] w-full rounded-xl" />;
  }

  if (!bestMortgages || bestMortgages.length === 0) {
    return null;
  }

  return (
    <Card className="border-t-[3px] border-t-violet-400 min-h-[180px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Home className="h-3.5 w-3.5 text-violet-500" />
            {translate("bestMortgages")}
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
      <CardContent className="space-y-1.5">
        {bestMortgages.map((mortgage) => (
          <div
            key={mortgage.id}
            className="flex items-center justify-between p-1.5 rounded-md bg-violet-500/5 border border-violet-500/10"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{mortgage.name}</p>
              {mortgage.product && (
                <p className="text-xs text-muted-foreground truncate">{mortgage.product}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <TrendingDown className="h-3.5 w-3.5 text-violet-500" />
              <p className="text-base font-bold text-violet-600 dark:text-violet-400">
                {formatPercent(mortgage.tna)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
