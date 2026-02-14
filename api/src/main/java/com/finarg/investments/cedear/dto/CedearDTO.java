package com.finarg.investments.cedear.dto;

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
public class CedearDTO implements Serializable {
    private String symbol;
    private String ticker;
    private String companyName;
    private BigDecimal lastPrice;
    private BigDecimal change;
    private BigDecimal changePercent;
    private BigDecimal volume;
    private String currency;
    private LocalDateTime lastUpdate;
}
