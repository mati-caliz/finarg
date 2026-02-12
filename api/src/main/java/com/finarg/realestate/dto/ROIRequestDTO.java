package com.finarg.realestate.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ROIRequestDTO(
    @NotNull(message = "Property price is required")
    @Positive(message = "Property price must be positive")
    BigDecimal propertyPrice,

    @NotNull(message = "Monthly rent is required")
    @Positive(message = "Monthly rent must be positive")
    BigDecimal monthlyRent,

    @DecimalMin(value = "0.0", message = "Annual appreciation must be >= 0")
    @DecimalMax(value = "100.0", message = "Annual appreciation must be <= 100")
    BigDecimal annualAppreciationPercent,

    @DecimalMin(value = "0.0", message = "Property tax must be >= 0")
    BigDecimal annualPropertyTax,

    @DecimalMin(value = "0.0", message = "Maintenance costs must be >= 0")
    BigDecimal annualMaintenanceCosts,

    @DecimalMin(value = "0.0", message = "Monthly expenses must be >= 0")
    BigDecimal monthlyExpenses,

    @DecimalMin(value = "0.0", message = "Down payment must be >= 0")
    @DecimalMax(value = "100.0", message = "Down payment must be <= 100")
    BigDecimal downPaymentPercent,

    @DecimalMin(value = "0.0", message = "Interest rate must be >= 0")
    BigDecimal mortgageInterestRate,

    @Min(value = 1, message = "Mortgage years must be >= 1")
    @Max(value = 30, message = "Mortgage years must be <= 30")
    Integer mortgageYears,

    @NotNull(message = "Currency is required")
    String currency,

    @Min(value = 1, message = "Analysis years must be >= 1")
    @Max(value = 30, message = "Analysis years must be <= 30")
    Integer analysisYears
) {
    public ROIRequestDTO {
        if (annualAppreciationPercent == null) {
            annualAppreciationPercent = BigDecimal.valueOf(3.0);
        }
        if (downPaymentPercent == null) {
            downPaymentPercent = BigDecimal.valueOf(20.0);
        }
        if (mortgageYears == null) {
            mortgageYears = 20;
        }
        if (analysisYears == null) {
            analysisYears = 10;
        }
        if (annualPropertyTax == null) {
            annualPropertyTax = BigDecimal.ZERO;
        }
        if (annualMaintenanceCosts == null) {
            annualMaintenanceCosts = BigDecimal.ZERO;
        }
        if (monthlyExpenses == null) {
            monthlyExpenses = BigDecimal.ZERO;
        }
        if (mortgageInterestRate == null) {
            mortgageInterestRate = BigDecimal.ZERO;
        }
    }
}
