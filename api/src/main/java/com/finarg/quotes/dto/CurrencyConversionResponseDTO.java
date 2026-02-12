package com.finarg.quotes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyConversionResponseDTO {

    private BigDecimal fromAmount;
    private BigDecimal toAmount;
    private String fromCurrency;
    private String toCurrency;
    private String fromCountry;
    private String toCountry;
    private ConversionRate conversionRate;
    private ConversionMetadata metadata;
    private LocalDateTime timestamp;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversionRate {
        private BigDecimal rate;
        private String fromPriceType;
        private String toPriceType;
        private BigDecimal fromQuotePrice;
        private BigDecimal toQuotePrice;
        private Boolean isDirectConversion;
        private String intermediaryCurrency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversionMetadata {
        private BigDecimal fromSpread;
        private BigDecimal toSpread;
        private BigDecimal fromSpreadPercentage;
        private BigDecimal toSpreadPercentage;
        private BigDecimal totalSpreadPercentage;
        private BigDecimal estimatedCommission;
        private BigDecimal effectiveRate;
    }
}
