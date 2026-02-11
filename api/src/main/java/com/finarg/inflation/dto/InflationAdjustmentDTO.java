package com.finarg.inflation.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InflationAdjustmentDTO implements Serializable {
    private BigDecimal originalAmount;
    private BigDecimal adjustedAmount;
    private LocalDate fromDate;
    private LocalDate toDate;
    private BigDecimal cumulativeInflation;
    private int monthsElapsed;
}
