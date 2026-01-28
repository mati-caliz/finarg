package com.finarg.model.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservesDTO implements Serializable {
    private BigDecimal grossReserves;
    private BigDecimal netReserves;
    private BigDecimal chinaSwap;
    private BigDecimal bankDeposits;
    private BigDecimal governmentDeposits;
    private LocalDate date;
    private BigDecimal dailyVariation;
    private String trend;
}
