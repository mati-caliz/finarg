package com.finarg.inflation.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InflationDTO implements Serializable {
    private LocalDate date;
    private BigDecimal value;
    private BigDecimal yearOverYear;
    private BigDecimal yearToDate;
}
