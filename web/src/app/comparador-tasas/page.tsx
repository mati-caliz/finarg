"use client";

import { QueryError } from "@/components/QueryError";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { ratesApi } from "@/lib/api";
import { useAppStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ExternalLink, Home, Landmark, Wallet } from "lucide-react";
import { type ElementType, useState } from "react"; // Added ElementType import

// --- Types & Constants ---

type TabType = "wallets" | "banks" | "usdAccounts" | "uvaMortgages";

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

const WALLET_DOMAINS: Record<string, string> = {
  Adcap: "ad-cap.com.ar",
  Balanz: "balanz.com",
  "Banco del Sol": "bancodelsol.com.ar",
  Belo: "belo.app",
  Brubank: "brubank.com",
  Buenbit: "buenbit.com",
  "Claro Pay": "claropay.com.ar",
  Cresium: "cresium.com.ar",
  Fiwind: "fiwind.io",
  "IEB+": "ieb.com.ar",
  "Lemon Cash": "lemon.me",
  Lemon: "lemon.me",
  "Let's Bit": "letsbit.io",
  "Mercado Pago": "mercadopago.com.ar",
  Naranja: "naranjax.com",
  "Naranja X": "naranjax.com",
  "Personal Pay": "personalpay.com.ar",
  Prex: "prexcard.com.ar",
  Reba: "reba.com.ar",
  "Toronto Ahorro": "torontotrust.com.ar",
  "Ual\u00E1": "uala.com.ar",
  "Yacar\u00E9": "yacare.com",
};

const BANK_DOMAINS: Record<string, string> = {
  ASTROPAY: "astropay.com",
  LETSBIT: "letsbit.io",
  BNA: "bna.com.ar",
  "Banco Nación": "bna.com.ar",
  "Banco de la Nación": "bna.com.ar",
  GALICIA: "bancogalicia.com",
  "Banco Galicia": "bancogalicia.com",
  SUPERVIELLE: "supervielle.com.ar",
  "Banco Supervielle": "supervielle.com.ar",
  BBVA: "bbva.com.ar",
  ICBC: "icbc.com.ar",
  Santander: "santander.com.ar",
  "Banco Santander": "santander.com.ar",
  HSBC: "hsbc.com.ar",
  Macro: "macro.com.ar",
  "Banco Macro": "macro.com.ar",
  "Banco Ciudad": "bancociudad.com.ar",
  "Ciudad de Buenos Aires": "bancociudad.com.ar",
  Patagonia: "bancopatagonia.com.ar",
  "Banco Patagonia": "bancopatagonia.com.ar",
  Comafi: "comafi.com.ar",
  "Banco Comafi": "comafi.com.ar",
  Itaú: "itau.com.ar",
  "Banco Itaú": "itau.com.ar",
  Credicoop: "bancocredicoop.coop",
  "Banco Credicoop": "bancocredicoop.coop",
};

// --- Helper Functions ---

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

function getLogoUrl(row: RateDTO): string {
  const walletDomain = Object.entries(WALLET_DOMAINS).find(([key]) =>
    row.name.toLowerCase().includes(key.toLowerCase()),
  )?.[1];

  if (walletDomain) {
    return `https://www.google.com/s2/favicons?domain=${walletDomain}&sz=128`;
  }

  const bankDomain = Object.entries(BANK_DOMAINS).find(([key]) =>
    row.name.toLowerCase().includes(key.toLowerCase()),
  )?.[1];

  if (bankDomain) {
    return `https://www.google.com/s2/favicons?domain=${bankDomain}&sz=128`;
  }

  return row.logo || "";
}

const formatPercent = (value: number) => `${Number(value).toFixed(1)}%`;

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) {
    return null;
  }
  const [y, m, d] = dateStr.split("-");
  return d && m && y ? `${d}/${m}/${y}` : dateStr;
};

const formatLimit = (limit: number | undefined) => {
  if (limit === undefined || limit === null || limit <= 0) {
    return null;
  }
  if (limit >= 1_000_000) {
    return `$${(limit / 1_000_000).toFixed(0)} M`;
  }
  if (limit >= 1_000) {
    return `$${(limit / 1_000).toFixed(0)} K`;
  }
  return `$${limit}`;
};

interface RateSectionProps {
  title: string;
  disclaimer: string;
  icon: ElementType;
  data: RateDTO[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  emptyMessage: string;
  maxTna: number;
  type: "wallet" | "bank" | "usd" | "mortgage";
  translate: (key: TranslationKey) => string;
}

const RateSection = ({
  title,
  disclaimer,
  icon: Icon,
  data,
  isLoading,
  error,
  refetch,
  emptyMessage,
  maxTna,
  type,
  translate,
}: RateSectionProps) => {
  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{disclaimer}</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <Skeleton key={id} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QueryError error={error} onRetry={refetch} compact />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card">
        <CardContent className="py-12 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{disclaimer}</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((row) => {
            const isBest =
              type === "mortgage"
                ? row.tna <= maxTna && maxTna > 0
                : row.tna >= maxTna && maxTna > 0;
            const limitStr = formatLimit(row.limit);
            const logoUrl = getLogoUrl(row);

            return (
              <Card
                key={row.id}
                className={`overflow-hidden transition-colors ${
                  isBest ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      {/* Logo Section */}
                      <div className="rate-logo flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/50 p-1.5">
                        {logoUrl ? (
                          <>
                            <img
                              src={logoUrl}
                              alt=""
                              className="rate-logo-img max-h-full max-w-full shrink-0 object-contain object-center"
                              loading="lazy"
                              onError={(e) => {
                                const img = e.currentTarget;
                                const domain = extractDomainFromFaviconUrl(logoUrl);
                                if (domain && !img.dataset.triedFallback) {
                                  img.dataset.triedFallback = "true";
                                  img.src = getFallbackLogoUrl(domain);
                                } else {
                                  img.style.display = "none";
                                  const fallback = img.nextElementSibling;
                                  if (fallback instanceof HTMLElement) {
                                    fallback.classList.remove("hidden");
                                    fallback.className =
                                      "rate-logo-fallback flex h-full w-full items-center justify-center";
                                  }
                                }
                              }}
                            />
                            <span className="rate-logo-fallback hidden h-full w-full items-center justify-center">
                              {type === "bank" ? (
                                <Landmark className="h-6 w-6 text-muted-foreground" />
                              ) : (
                                <Wallet className="h-6 w-6 text-muted-foreground" />
                              )}
                            </span>
                          </>
                        ) : type === "bank" ? (
                          <Landmark className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <Wallet className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Info Section */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">{row.name}</span>
                          {isBest && (
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                              {translate(type === "mortgage" ? "lowest" : "highest")}
                            </span>
                          )}
                        </div>

                        {/* Product Description */}
                        {row.product && (
                          <div className="mt-1 max-h-20 overflow-y-auto overscroll-contain">
                            <p className="text-xs text-muted-foreground leading-relaxed pr-1">
                              {row.product}
                            </p>
                          </div>
                        )}

                        {/* Tags (Term/Limit/Type) */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {type === "bank" ? (
                            <span className="rounded border border-border px-2 py-0.5 text-xs">
                              {row.term ?? "30 días"}
                            </span>
                          ) : (
                            <span className="rounded border border-border px-2 py-0.5 text-xs">
                              {type === "usd" ? "USD" : translate("wallet")}
                            </span>
                          )}

                          {type !== "bank" &&
                            (limitStr ? (
                              <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                                {translate("limitLabel")}: {limitStr}
                              </span>
                            ) : (
                              <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                                {translate("noLimit")}
                              </span>
                            ))}
                        </div>

                        {/* External Link (Banks only) */}
                        {type === "bank" && row.link && (
                          <a
                            href={row.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {translate("seeMore")}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Rates Section */}
                    <div className="flex shrink-0 flex-col items-end">
                      <span className="text-2xl font-bold text-primary">
                        {row.tna > 0 ? formatPercent(row.tna) : "-"}
                      </span>
                      <span className="text-xs text-muted-foreground">TNA</span>
                      {row.tea !== undefined && row.tea !== null && (
                        <span className="mt-1 text-sm text-muted-foreground">
                          TEA {formatPercent(row.tea)}
                        </span>
                      )}
                      {row.date && (
                        <div className="mt-1 text-xs text-muted-foreground text-right leading-tight">
                          <span className="block">{translate("tnaValidSince")}</span>
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
      </CardContent>
    </Card>
  );
};

// --- Main Page Component ---

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
    queryKey: ["rates", "fixed-term", selectedCountry],
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
    queryKey: ["rates", "wallets", selectedCountry],
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
    queryKey: ["rates", "usd-accounts", selectedCountry],
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
    queryKey: ["rates", "uva-mortgages", selectedCountry],
    queryFn: async () => {
      const res = await ratesApi.getUvaMortgages(selectedCountry);
      return (res.data as RateDTO[]) ?? [];
    },
    enabled: selectedCountry === "ar",
  });

  const showWallets = selectedCountry === "ar";
  const showBanks = selectedCountry === "ar";

  const maxBankTna = bankRates.length > 0 ? Math.max(...bankRates.map((r) => r.tna)) : 0;
  const maxWalletTna = walletRates.length > 0 ? Math.max(...walletRates.map((r) => r.tna)) : 0;
  const maxUsdAccountTna =
    usdAccountRates.length > 0 ? Math.max(...usdAccountRates.map((r) => r.tna)) : 0;
  const minUvaMortgageTna =
    uvaMortgageRates.length > 0 ? Math.min(...uvaMortgageRates.map((r) => r.tna)) : 0;

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
          maxTna={maxWalletTna}
          type="wallet"
          translate={translate}
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
          maxTna={maxBankTna}
          type="bank"
          translate={translate}
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
          emptyMessage="No hay datos disponibles"
          maxTna={maxUsdAccountTna}
          type="usd"
          translate={translate}
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
          emptyMessage="No hay datos disponibles"
          maxTna={minUvaMortgageTna}
          type="mortgage"
          translate={translate}
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
