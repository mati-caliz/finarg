"use client";

import { useCedears } from "@/hooks/useInvestments";
import { INVESTMENT_GRID } from "@/lib/constants";
import { InvestmentCard } from "./InvestmentCard";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";
import { cedearToCardProps } from "./investmentAdapters";

export function CedearsSection() {
  const { data: cedears, isLoading, error } = useCedears();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={cedears === null || cedears === undefined || cedears.length === 0}
      gridClassName={INVESTMENT_GRID.FOUR_COL}
      skeletonCount={8}
      skeletonHeight="h-32"
    >
      {cedears?.map((cedear) => (
        <InvestmentCard key={cedear.symbol} {...cedearToCardProps(cedear)} />
      ))}
    </InvestmentSectionWrapper>
  );
}
