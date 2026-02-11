package com.finarg.indicators.countryrisk.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CountryRiskDTO implements Serializable {
    private BigDecimal value;
    private LocalDate date;
}
