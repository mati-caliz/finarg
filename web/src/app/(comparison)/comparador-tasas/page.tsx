"use client";

import { RateSection } from "@/components/comparison/RateSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { ratesApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAppStore } from "@/store/useStore";
import type { RateDTO } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Home, Landmark, Wallet } from "lucide-react";
import { useState } from "react";

type TabType = "wallets" | "banks" | "usdAccounts" | "uvaMortgages";

export default function RatesPage() {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const [activeTab, setActiveTab] = useState<TabType>("wallets");

  const {
    data: bankRates = [],
    isLoading: banksLoading,
    error: banksErrorData,
    refetch: refetchBanks,
  } = useQuery({
    queryKey: queryKeys.rates.fixedTerm(selectedCountry),
    queryFn: async () => {
      const res = await ratesApi.getFixedTerm(selectedCountry);
      return (res.data as RateDTO[]) ?? [];
    },
    enabled: selectedCountry === "ar",
  });

  const {
    data: walletRates = [],
    isLoading: walletsLoading,
    error: walletsErrorData,
    refetch: refetchWallets,
  } = useQuery({
    queryKey: queryKeys.rates.wallets(selectedCountry),
    queryFn: async () => {
      const res = await ratesApi.getWallets(selectedCountry);
      return (res.data as RateDTO[]) ?? [];
    },
    enabled: selectedCountry === "ar",
  });

  const {
    data: usdAccountRates = [],
    isLoading: usdAccountsLoading,
    error: usdAccountsErrorData,
    refetch: refetchUsdAccounts,
  } = useQuery({
    queryKey: queryKeys.rates.usdAccounts(selectedCountry),
    queryFn: async () => {
      const res = await ratesApi.getUsdAccounts(selectedCountry);
      return (res.data as RateDTO[]) ?? [];
    },
    enabled: selectedCountry === "ar",
  });

  const {
    data: uvaMortgageRates = [],
    isLoading: uvaMortgagesLoading,
    error: uvaMortgagesErrorData,
    refetch: refetchUvaMortgages,
  } = useQuery({
    queryKey: queryKeys.rates.uvaMortgages(selectedCountry),
    queryFn: async () => {
      const res = await ratesApi.getUvaMortgages(selectedCountry);
      return (res.data as RateDTO[]) ?? [];
    },
    enabled: selectedCountry === "ar",
  });

  const showWallets = selectedCountry === "ar";
  const showBanks = selectedCountry === "ar";

  if (!showWallets && !showBanks) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translate("ratesComparator")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{translate("ratesComparatorDesc")}</p>
        </div>
        <Card className="bg-card">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-muted-foreground">{translate("ratesNotAvailableCountry")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translate("ratesComparator")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{translate("ratesComparatorDesc")}</p>
          <p className="text-muted-foreground text-xs mt-1">{translate("ratesUpdateNote")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {showWallets && (
          <Button
            variant={activeTab === "wallets" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("wallets")}
            className="flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            {translate("walletRates")}
          </Button>
        )}
        {showBanks && (
          <Button
            variant={activeTab === "banks" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("banks")}
            className="flex items-center gap-2"
          >
            <Landmark className="h-4 w-4" />
            {translate("fixedTermRates")}
          </Button>
        )}
        {showWallets && (
          <Button
            variant={activeTab === "usdAccounts" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("usdAccounts")}
            className="flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            {translate("usdAccounts")}
          </Button>
        )}
        {showWallets && (
          <Button
            variant={activeTab === "uvaMortgages" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("uvaMortgages")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            {translate("uvaMortgages")}
          </Button>
        )}
      </div>

      {activeTab === "wallets" && showWallets && (
        <RateSection
          title={translate("walletTnaRates")}
          disclaimer={translate("walletRatesDisclaimer")}
          icon={Wallet}
          data={walletRates}
          isLoading={walletsLoading}
          error={walletsErrorData as Error}
          refetch={refetchWallets}
          emptyMessage={translate("noWalletRates")}
          type="wallet"
        />
      )}

      {activeTab === "banks" && showBanks && (
        <RateSection
          title={translate("fixedTermBankRates")}
          disclaimer={translate("fixedTermRatesDisclaimer")}
          icon={Landmark}
          data={bankRates}
          isLoading={banksLoading}
          error={banksErrorData as Error}
          refetch={refetchBanks}
          emptyMessage={translate("noBankRates")}
          type="bank"
        />
      )}

      {activeTab === "usdAccounts" && showWallets && (
        <RateSection
          title={translate("usdAccountsRates")}
          disclaimer={translate("usdAccountsDisclaimer")}
          icon={Wallet}
          data={usdAccountRates}
          isLoading={usdAccountsLoading}
          error={usdAccountsErrorData as Error}
          refetch={refetchUsdAccounts}
          emptyMessage={translate("noDataAvailable")}
          type="usd"
        />
      )}

      {activeTab === "uvaMortgages" && showWallets && (
        <RateSection
          title={translate("uvaMortgagesRates")}
          disclaimer={translate("uvaMortgagesDisclaimer")}
          icon={Home}
          data={uvaMortgageRates}
          isLoading={uvaMortgagesLoading}
          error={uvaMortgagesErrorData as Error}
          refetch={refetchUvaMortgages}
          emptyMessage={translate("noDataAvailable")}
          type="mortgage"
        />
      )}

      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-500 font-medium mb-1">{translate("importantInfo")}</p>
              <p className="text-muted-foreground">{translate("ratesDisclaimer")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
