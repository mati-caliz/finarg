"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { NewsArticle } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

export interface NewsCardProps {
  article: NewsArticle;
}

const sentimentColors = {
  POSITIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  NEUTRAL: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  NEGATIVE: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  MIXED: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const categoryColors = {
  EXCHANGE_RATE: "border-t-emerald-500",
  MONETARY_POLICY: "border-t-blue-500",
  INFLATION: "border-t-red-500",
  RESERVES: "border-t-cyan-500",
  FISCAL_POLICY: "border-t-violet-500",
  FINANCIAL_MARKETS: "border-t-amber-500",
  ECONOMY_GENERAL: "border-t-slate-400",
  CRYPTO: "border-t-orange-500",
  INTERNATIONAL: "border-t-pink-500",
  BCRA_BULLETIN: "border-t-indigo-500",
  GOVERNMENT_BULLETIN: "border-t-purple-500",
};

const sentimentLabels = {
  POSITIVE: "Positivo",
  NEUTRAL: "Neutral",
  NEGATIVE: "Negativo",
  MIXED: "Mixto",
};

export const NewsCard = memo(function NewsCard({ article }: NewsCardProps) {
  const relativeTime = formatDistanceToNow(new Date(article.publishedDate), {
    addSuffix: true,
    locale: es,
  });

  return (
    <Card className={`border-t-[3px] ${categoryColors[article.category]} overflow-hidden`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold leading-tight mb-2 line-clamp-2">
              {article.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{article.source}</span>
              <span>•</span>
              <time dateTime={article.publishedDate}>{relativeTime}</time>
              {article.isOfficial && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    Oficial
                  </Badge>
                </>
              )}
            </div>
          </div>
          {article.sentiment && (
            <Badge className={sentimentColors[article.sentiment]}>
              {sentimentLabels[article.sentiment]}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {article.aiSummary && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">Resumen IA</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{article.aiSummary}</p>
          </div>
        )}

        {article.keyPoints && article.keyPoints.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Puntos clave
            </p>
            <ul className="space-y-1">
              {article.keyPoints
                .filter((point) => point?.trim())
                .map((point, index) => (
                  <li key={`${article.id}-${index}`} className="flex items-start gap-2 text-sm">
                    <span className="text-violet-500 mt-1">•</span>
                    <span className="flex-1">{point.trim()}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="pt-2">
          <Link
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 hover:underline"
          >
            Leer artículo completo
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});
