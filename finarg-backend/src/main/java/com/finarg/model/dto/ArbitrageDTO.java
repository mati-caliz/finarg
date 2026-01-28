package com.finarg.model.dto;

import com.finarg.model.enums.CurrencyType;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArbitrageDTO implements Serializable {
    private CurrencyType sourceType;
    private CurrencyType targetType;
    private BigDecimal sourceRate;
    private BigDecimal targetRate;
    private BigDecimal spreadPercentage;
    private BigDecimal estimatedProfitPer1000USD;
    private String description;
    private String steps;
    private boolean viable;
    private String risk;
}
