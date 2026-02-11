package com.finarg.crypto.dto;

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
public class CryptoDTO implements Serializable {
    private String symbol;
    private String name;
    private BigDecimal priceUsd;
    private BigDecimal change24h;
    private LocalDateTime lastUpdate;
}
