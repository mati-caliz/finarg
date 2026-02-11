package com.finarg.indicators.social.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialIndicatorsDTO implements Serializable {

    private BigDecimal minimumSalary;
    private BigDecimal minimumPension;
    private BigDecimal totalBasicBasket;
    private BigDecimal foodBasicBasket;
    private BigDecimal ripteSalary;
    private BigDecimal averageSalary;
    private BigDecimal uva;
    private BigDecimal cer;
}
