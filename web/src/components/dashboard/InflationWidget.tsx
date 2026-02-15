"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentInflation } from "@/hooks/useInflation";
import { useTranslation } from "@/hooks/useTranslation";
import { Percent, TrendingUp } from "lucide-react";
import Link from "next/link";

export function InflationWidget() {
  const { translate } = useTranslation();
  const { data: inflation } = useCurrentInflation();

  return (
    <Link href="/inflacion" className="block shrink-0">
      <Card className="border-t-[3px] border-t-red-400 transition-all hover:shadow-lg hover:border-red-300 cursor-pointer min-h-[160px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Percent className="h-3.5 w-3.5" />
            {translate("monthlyInflation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-red-500">
                {inflation?.value?.toFixed(1) ?? "0"}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">{translate("last12Months")}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15">
              <TrendingUp className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
