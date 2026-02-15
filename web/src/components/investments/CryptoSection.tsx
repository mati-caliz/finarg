"use client";

import { useCrypto } from "@/hooks/useCrypto";
import { INVESTMENT_GRID } from "@/lib/constants";
import { InvestmentCard } from "./InvestmentCard";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";
import { cryptoToCardProps } from "./investmentAdapters";

export function CryptoSection() {
  const { data: cryptoList, isLoading, error } = useCrypto();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={cryptoList === null || cryptoList === undefined || cryptoList.length === 0}
      gridClassName={INVESTMENT_GRID.FOUR_COL}
      skeletonCount={8}
      skeletonHeight="h-32"
    >
      {cryptoList?.map((crypto) => (
        <InvestmentCard key={crypto.symbol} {...cryptoToCardProps(crypto)} />
      ))}
    </InvestmentSectionWrapper>
  );
}
