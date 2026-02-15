"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice, formatVariation } from "@/lib/utils";
import type { Crypto } from "@/types";
import { Bitcoin, TrendingDown, TrendingUp } from "lucide-react";
import { memo } from "react";

interface CryptoWidgetProps {
  cryptoList: Crypto[];
}

export const CryptoWidget = memo(function CryptoWidget({ cryptoList }: CryptoWidgetProps) {
  const { translate } = useTranslation();

  return (
    <Card className="shrink-0 border-t-[3px] border-t-orange-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Bitcoin className="h-3.5 w-3.5" />
          {translate("crypto")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-6">
        <div className="grid grid-cols-3 gap-4">
          {cryptoList.map((crypto) => (
            <div key={crypto.symbol} className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-xs font-medium text-foreground">{crypto.symbol}</p>
                <div
                  className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium ${
                    crypto.change24h >= 0
                      ? "bg-success-accessible/10 text-success-accessible"
                      : "bg-destructive-accessible/10 text-destructive-accessible"
                  }`}
                >
                  {crypto.change24h >= 0 ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {formatVariation(crypto.change24h)}
                </div>
              </div>
              <p className="text-lg font-bold text-foreground">
                {formatPrice(crypto.priceUsd, "USD")}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">USD</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
