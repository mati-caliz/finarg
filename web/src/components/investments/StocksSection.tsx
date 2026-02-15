"use client";

import { useStocks } from "@/hooks/useInvestments";
import { INVESTMENT_GRID } from "@/lib/constants";
import { InvestmentCard } from "./InvestmentCard";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";
import { stockToCardProps } from "./investmentAdapters";

export function StocksSection() {
  const { data: stocks, isLoading, error } = useStocks();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={stocks === null || stocks === undefined || stocks.length === 0}
      gridClassName={INVESTMENT_GRID.FOUR_COL}
      skeletonCount={8}
      skeletonHeight="h-32"
    >
      {stocks?.map((stock) => (
        <InvestmentCard key={stock.ticker} {...stockToCardProps(stock)} />
      ))}
    </InvestmentSectionWrapper>
  );
}
