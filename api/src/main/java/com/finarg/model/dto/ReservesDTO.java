package com.finarg.model.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservesDTO implements Serializable {
    private BigDecimal grossReserves;
    private BigDecimal netReserves;
    private BigDecimal netReservesBCRA;
    private BigDecimal netReservesFMI;
    private List<ReserveLiabilityDTO> liabilitiesBCRA;
    private List<ReserveLiabilityDTO> liabilitiesFMI;
    private List<ReserveLiabilityDTO> liabilities;
    private LocalDate date;
    private BigDecimal dailyVariation;
    private String trend;
}
