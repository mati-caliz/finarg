package com.finarg.realestate.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record ROIResponseDTO(
    BuyScenarioDTO buyScenario,
    RentScenarioDTO rentScenario,
    ComparisonDTO comparison,
    Integer breakEvenYear,
    String recommendation,
    LocalDateTime calculatedAt
) {

    @Builder
    public record BuyScenarioDTO(
        BigDecimal totalInitialCost,
        BigDecimal downPayment,
        BigDecimal mortgageAmount,
        BigDecimal monthlyMortgagePayment,
        BigDecimal totalMortgageInterest,
        BigDecimal totalPropertyTaxPaid,
        BigDecimal totalMaintenancePaid,
        BigDecimal propertyValueAtEnd,
        BigDecimal totalEquityBuilt,
        BigDecimal netWorthAtEnd,
        BigDecimal totalCostOverYears,
        BigDecimal annualizedROI
    ) {
    }

    @Builder
    public record RentScenarioDTO(
        BigDecimal totalRentPaid,
        BigDecimal totalExpensesPaid,
        BigDecimal investmentValue,
        BigDecimal investmentReturns,
        BigDecimal netWorthAtEnd,
        BigDecimal totalCostOverYears
    ) {
    }

    @Builder
    public record ComparisonDTO(
        BigDecimal netWorthDifference,
        BigDecimal percentageDifference,
        String betterOption,
        BigDecimal monthlyCostDifference
    ) {
    }
}
