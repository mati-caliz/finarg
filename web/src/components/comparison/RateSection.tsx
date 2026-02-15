"use client";

import { QueryError } from "@/components/QueryError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDateSlash, formatLimit, formatPercent } from "@/lib/utils";
import { ExternalLink, Landmark, Wallet } from "lucide-react";
import type { ElementType } from "react";

export interface RateDTO {
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

function getOptimizedLogoUrl(originalUrl: string): string {
  if (!originalUrl) {
    return "";
  }

  const domain = extractDomainFromFaviconUrl(originalUrl);
  if (domain) {
    return getFallbackLogoUrl(domain);
  }

  return originalUrl;
}

export interface RateSectionProps {
  title: string;
  disclaimer: string;
  icon: ElementType;
  data: RateDTO[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  emptyMessage: string;
  type: "wallet" | "bank" | "usd" | "mortgage";
}

export function RateSection({
  title,
  disclaimer,
  icon: Icon,
  data,
  isLoading,
  error,
  refetch,
  emptyMessage,
  type,
}: RateSectionProps) {
  const { translate } = useTranslation();

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
          {data.map((row, index) => {
            const isBest = row.isBestRate === true;
            const limitStr = formatLimit(row.limit);
            const originalLogoUrl = row.logo || "";
            const optimizedLogoUrl = getOptimizedLogoUrl(originalLogoUrl);

            return (
              <Card
                key={`${type}-${row.id}-${index}`}
                className={`overflow-hidden transition-colors ${
                  isBest ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="rate-logo flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/50 p-1.5">
                        {optimizedLogoUrl ? (
                          <>
                            <img
                              src={optimizedLogoUrl}
                              alt=""
                              className="rate-logo-img max-h-full max-w-full shrink-0 object-contain object-center"
                              loading="lazy"
                              onError={(e) => {
                                const img = e.currentTarget;
                                img.style.display = "none";
                                const fallback = img.nextElementSibling;
                                if (fallback instanceof HTMLElement) {
                                  fallback.classList.remove("hidden");
                                  fallback.className =
                                    "rate-logo-fallback flex h-full w-full items-center justify-center";
                                }
                              }}
                            />
                            <span className="rate-logo-fallback hidden h-full w-full items-center justify-center">
                              {type === "bank" || type === "usd" ? (
                                <Landmark className="h-6 w-6 text-muted-foreground" />
                              ) : (
                                <Wallet className="h-6 w-6 text-muted-foreground" />
                              )}
                            </span>
                          </>
                        ) : type === "bank" || type === "usd" ? (
                          <Landmark className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <Wallet className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">{row.name}</span>
                          {isBest && (
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                              {translate(type === "mortgage" ? "lowest" : "highest")}
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
                          {type === "bank" ? (
                            <span className="rounded border border-border px-2 py-0.5 text-xs">
                              {row.term ?? "30 dias"}
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

                    <div className="flex shrink-0 flex-col items-end">
                      <span className="text-2xl font-bold text-primary">
                        {row.tna > 0 ? formatPercent(row.tna, 1) : "-"}
                      </span>
                      <span className="text-xs text-muted-foreground">TNA</span>
                      {row.tea !== undefined && row.tea !== null && (
                        <span className="mt-1 text-sm text-muted-foreground">
                          TEA {formatPercent(row.tea, 1)}
                        </span>
                      )}
                      {row.date && (
                        <div className="mt-1 text-xs text-muted-foreground text-right leading-tight">
                          <span className="block">{translate("tnaValidSince")}</span>
                          <span className="block">{formatDateSlash(row.date)}</span>
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
}
