package com.finarg.calculators.incometax.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomeTaxResponseDTO implements Serializable {

    private BigDecimal grossMonthlySalary;
    private BigDecimal grossAnnualSalary;
    private BigDecimal monthlyLegalDeductions;
    private BigDecimal totalDeductions;

    @JsonProperty("taxableNetIncome")
    private BigDecimal taxableIncome;

    private BigDecimal annualTax;
    private BigDecimal monthlyTax;
    private BigDecimal effectiveRate;

    @JsonProperty("monthlyNetSalary")
    private BigDecimal netMonthlySalary;

    private CalculationDetails calculationDetails;

    private DeductionBreakdown deductionBreakdown;

    @JsonProperty("bracketBreakdown")
    private List<TaxBracket> taxBrackets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeductionBreakdown implements Serializable {
        private BigDecimal retirement;
        private BigDecimal healthInsurance;
        private BigDecimal law19032;
        private BigDecimal unionDues;
        private BigDecimal incomeTax;
        private BigDecimal total;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalculationDetails implements Serializable {

        @JsonProperty("nonTaxableMinimum")
        private BigDecimal minimumExemption;

        private BigDecimal specialDeduction;

        @JsonProperty("familyCharges")
        private BigDecimal familyAllowances;

        private BigDecimal personalDeductions;
        private BigDecimal totalAllowedDeductions;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaxBracket implements Serializable {
        private int bracket;
        private BigDecimal from;
        private BigDecimal to;
        private BigDecimal rate;
        private BigDecimal taxableBase;
        private BigDecimal bracketTax;
    }
}
