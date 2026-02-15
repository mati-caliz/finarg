"use client";

import { useEtfs } from "@/hooks/useInvestments";
import { INVESTMENT_GRID } from "@/lib/constants";
import { InvestmentCard } from "./InvestmentCard";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";
import { etfToCardProps } from "./investmentAdapters";

export function EtfsSection() {
  const { data: etfs, isLoading, error } = useEtfs();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={etfs === null || etfs === undefined || etfs.length === 0}
      gridClassName={INVESTMENT_GRID.FOUR_COL}
      skeletonCount={8}
      skeletonHeight="h-32"
    >
      {etfs?.map((etf) => (
        <InvestmentCard key={etf.ticker} {...etfToCardProps(etf)} />
      ))}
    </InvestmentSectionWrapper>
  );
}
