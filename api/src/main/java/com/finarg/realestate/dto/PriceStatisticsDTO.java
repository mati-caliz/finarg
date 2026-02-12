package com.finarg.realestate.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record PriceStatisticsDTO(
    BigDecimal averagePricePerM2,
    BigDecimal medianPricePerM2,
    BigDecimal minPricePerM2,
    BigDecimal maxPricePerM2,
    BigDecimal averageTotalPrice,
    BigDecimal medianTotalPrice,
    Integer propertiesCount,
    BigDecimal totalSurfaceM2Analyzed
) {
}
