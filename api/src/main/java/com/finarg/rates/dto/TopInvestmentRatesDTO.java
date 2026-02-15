package com.finarg.rates.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopInvestmentRatesDTO {
    private List<RateDTO> topWallets;
    private List<RateDTO> topBanks;
}
