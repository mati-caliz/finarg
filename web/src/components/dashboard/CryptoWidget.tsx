"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import type { Crypto } from "@/types";
import { Bitcoin, TrendingDown, TrendingUp } from "lucide-react";
import { memo } from "react";

interface CryptoWidgetProps {
  cryptoList: Crypto[];
}

export const CryptoWidget = memo(function CryptoWidget({ cryptoList }: CryptoWidgetProps) {
  const { translate } = useTranslation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number) => {
    return `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
  };

  return (
    <Card className="shrink-0 border-t-[3px] border-t-orange-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Bitcoin className="h-3.5 w-3.5" />
          {translate("crypto")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-6">
        <div className="space-y-3">
          {cryptoList.map((crypto) => (
            <div key={crypto.symbol} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{crypto.symbol}</p>
                  <div
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                      crypto.change24h >= 0
                        ? "bg-success-accessible/10 text-success-accessible"
                        : "bg-destructive-accessible/10 text-destructive-accessible"
                    }`}
                  >
                    {crypto.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {formatChange(crypto.change24h)}
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground mt-0.5">
                  {formatPrice(crypto.priceUsd)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
