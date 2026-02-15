"use client";

import { useMetals } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import { INVESTMENT_GRID } from "@/lib/constants";
import { InvestmentCard } from "./InvestmentCard";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";
import { metalToCardProps } from "./investmentAdapters";

export function MetalsSection() {
  const { translate } = useTranslation();
  const { data: metals, isLoading, error } = useMetals();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={metals === null || metals === undefined || metals.length === 0}
      gridClassName={INVESTMENT_GRID.FOUR_COL}
      skeletonCount={4}
      skeletonHeight="h-32"
    >
      {metals?.map((metal) => (
        <InvestmentCard key={metal.metalType} {...metalToCardProps(metal, translate)} />
      ))}
    </InvestmentSectionWrapper>
  );
}
