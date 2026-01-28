package com.finarg.model.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomeTaxResponseDTO implements Serializable {
    
    private BigDecimal grossAnnualSalary;
    private BigDecimal totalDeductions;
    private BigDecimal taxableIncome;
    private BigDecimal annualTax;
    private BigDecimal monthlyTax;
    private BigDecimal effectiveRate;
    private BigDecimal netMonthlySalary;
    
    private CalculationDetails calculationDetails;
    private List<TaxBracket> taxBrackets;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalculationDetails implements Serializable {
        private BigDecimal minimumExemption;
        private BigDecimal specialDeduction;
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
