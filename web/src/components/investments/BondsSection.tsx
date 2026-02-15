"use client";

import { useBonds } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import { INVESTMENT_GRID } from "@/lib/constants";
import { InvestmentCard } from "./InvestmentCard";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";
import { bondToCardProps } from "./investmentAdapters";

export function BondsSection() {
  const { translate } = useTranslation();
  const { data: bonds, isLoading, error } = useBonds();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={bonds === null || bonds === undefined || bonds.length === 0}
      gridClassName={INVESTMENT_GRID.THREE_COL}
      skeletonCount={6}
      skeletonHeight="h-40"
    >
      {bonds?.map((bond) => (
        <InvestmentCard key={bond.ticker} {...bondToCardProps(bond, translate)} />
      ))}
    </InvestmentSectionWrapper>
  );
}
