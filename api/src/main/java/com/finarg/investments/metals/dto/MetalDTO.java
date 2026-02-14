package com.finarg.investments.metals.dto;

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
public class MetalDTO implements Serializable {
    private String metalType;
    private String unit;
    private BigDecimal priceUsd;
    private BigDecimal change24h;
    private BigDecimal changePercent24h;
    private LocalDateTime lastUpdate;
}
