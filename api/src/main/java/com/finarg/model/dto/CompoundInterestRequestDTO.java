package com.finarg.model.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompoundInterestRequestDTO {

    @NotNull(message = "Initial capital is required")
    @DecimalMin(value = "0.01", message = "Initial capital must be greater than 0")
    private BigDecimal initialCapital;

    @NotNull(message = "Annual rate is required")
    @DecimalMin(value = "0.0", message = "Annual rate must be at least 0")
    @DecimalMax(value = "200.0", message = "Annual rate must not exceed 200%")
    private BigDecimal annualRate;

    @NotNull(message = "Years is required")
    @Min(value = 1, message = "Years must be at least 1")
    @Max(value = 50, message = "Years must not exceed 50")
    private Integer years;

    @NotNull(message = "Compounding frequency is required")
    private CompoundingFrequency compoundingFrequency;

    @DecimalMin(value = "0.0", message = "Periodic contribution must be at least 0")
    private BigDecimal periodicContribution;

    public enum CompoundingFrequency {
        MONTHLY(12),
        QUARTERLY(4),
        YEARLY(1);

        private final int periodsPerYear;

        CompoundingFrequency(int periodsPerYear) {
            this.periodsPerYear = periodsPerYear;
        }

        public int getPeriodsPerYear() {
            return periodsPerYear;
        }
    }
}
