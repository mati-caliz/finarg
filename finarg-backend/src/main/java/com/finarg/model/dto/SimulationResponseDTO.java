package com.finarg.model.dto;

import com.finarg.model.enums.InvestmentType;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResponseDTO implements Serializable {
    
    private InvestmentType investmentType;
    private BigDecimal initialAmount;
    private Integer termDays;
    private BigDecimal nominalAnnualRate;
    private BigDecimal effectiveAnnualRate;
    private BigDecimal nominalReturn;
    private BigDecimal realReturn;
    private BigDecimal finalAmount;
    private BigDecimal profitARS;
    private BigDecimal profitUSD;
    private BigDecimal dollarReturn;
    
    private List<MonthlyProjection> projection;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyProjection implements Serializable {
        private int month;
        private BigDecimal accumulatedCapital;
        private BigDecimal monthlyInterest;
        private BigDecimal estimatedInflation;
        private BigDecimal realReturn;
    }
}
