package com.finarg.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompoundInterestResponseDTO {

    private BigDecimal finalAmount;
    private BigDecimal totalContributions;
    private BigDecimal totalInterest;
    private List<PeriodDetail> periods;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeriodDetail {
        private Integer period;
        private BigDecimal principal;
        private BigDecimal interest;
        private BigDecimal total;
    }
}
