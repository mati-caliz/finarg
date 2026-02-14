package com.finarg.reserves.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BcraExcelLiabilitiesDTO implements Serializable {
    private BigDecimal swapChina;
    private BigDecimal swapUsa;
    private BigDecimal repoSedesa;
    private BigDecimal bankDeposits;
    private BigDecimal governmentDeposits;
    private BigDecimal leliqPases;
    private BigDecimal otherShortTermBcra;
    private BigDecimal otherShortTermFmi;
    private BigDecimal treasuryLiabilitiesFmi;
    private LocalDate lastUpdate;
    private String dataSource;
}
