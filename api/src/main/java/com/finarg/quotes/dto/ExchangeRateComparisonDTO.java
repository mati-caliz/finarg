package com.finarg.quotes.dto;

import com.finarg.shared.enums.Country;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateComparisonDTO {
    private Country country;
    private List<ExchangeRateItemDTO> rates;
    private ExchangeRateItemDTO cheapestToBuy;
    private ExchangeRateItemDTO cheapestToSell;
    private ExchangeRateItemDTO mostExpensiveToBuy;
    private ExchangeRateItemDTO mostExpensiveToSell;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExchangeRateItemDTO {
        private String type;
        private String name;
        private String baseCurrency;
        private BigDecimal buy;
        private BigDecimal sell;
        private BigDecimal spread;
        private BigDecimal spreadPercentage;
        private BigDecimal variation;
    }
}
