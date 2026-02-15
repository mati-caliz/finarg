"use client";

import { useLetras } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import { INVESTMENT_GRID } from "@/lib/constants";
import { InvestmentCard } from "./InvestmentCard";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";
import { letraToCardProps } from "./investmentAdapters";

export function LetrasSection() {
  const { translate } = useTranslation();
  const { data: letras, isLoading, error } = useLetras();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={letras === null || letras === undefined || letras.length === 0}
      gridClassName={INVESTMENT_GRID.THREE_COL}
      skeletonCount={6}
      skeletonHeight="h-40"
    >
      {letras?.map((letra) => (
        <InvestmentCard key={letra.ticker} {...letraToCardProps(letra, translate)} />
      ))}
    </InvestmentSectionWrapper>
  );
}
