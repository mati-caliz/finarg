package com.finarg.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeBandsDTO {
    private BigDecimal floor;
    private BigDecimal ceiling;
    private BigDecimal middle;
    private BigDecimal crawlingPegMonthly;
    private LocalDate lastUpdate;
    private String notes;
}
