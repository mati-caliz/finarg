package com.finarg.investments.cauciones.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaucionDTO implements Serializable {
    private Integer days;
    private String ticker;
    private BigDecimal rate;
    private BigDecimal change;
    private BigDecimal changePercent;
    private BigDecimal minRate;
    private BigDecimal maxRate;
    private LocalDateTime lastUpdate;
}
