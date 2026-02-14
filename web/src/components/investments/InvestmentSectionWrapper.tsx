"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import type { ReactNode } from "react";

interface InvestmentSectionWrapperProps {
  isLoading: boolean;
  error: unknown;
  isEmpty: boolean;
  gridClassName: string;
  skeletonCount: number;
  skeletonHeight: string;
  children: ReactNode;
}

export function InvestmentSectionWrapper({
  isLoading,
  error,
  isEmpty,
  gridClassName,
  skeletonCount,
  skeletonHeight,
  children,
}: InvestmentSectionWrapperProps) {
  const { translate } = useTranslation();

  if (isLoading) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: skeletonCount }, (_, i) => `skeleton-${i}`).map((id) => (
          <Skeleton key={id} className={skeletonHeight} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{translate("errorLoadingData")}</p>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">{translate("noDataAvailable")}</p>
        </CardContent>
      </Card>
    );
  }

  return <div className={gridClassName}>{children}</div>;
}
