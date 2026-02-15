"use client";

import { useCauciones } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import { INVESTMENT_GRID } from "@/lib/constants";
import { InvestmentCard } from "./InvestmentCard";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";
import { caucionToCardProps } from "./investmentAdapters";

export function CaucionesSection() {
  const { translate } = useTranslation();
  const { data: cauciones, isLoading, error } = useCauciones();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={cauciones === null || cauciones === undefined || cauciones.length === 0}
      gridClassName={INVESTMENT_GRID.THREE_COL}
      skeletonCount={6}
      skeletonHeight="h-40"
    >
      {cauciones?.map((caucion) => (
        <InvestmentCard key={caucion.ticker} {...caucionToCardProps(caucion, translate)} />
      ))}
    </InvestmentSectionWrapper>
  );
}
