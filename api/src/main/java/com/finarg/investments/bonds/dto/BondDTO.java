package com.finarg.investments.bonds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BondDTO implements Serializable {
    private String ticker;
    private String name;
    private String issuer;
    private LocalDate maturity;
    private BigDecimal yieldPercent;
    private BigDecimal price;
    private String currency;
    private String rating;
    private LocalDateTime lastUpdate;
}
