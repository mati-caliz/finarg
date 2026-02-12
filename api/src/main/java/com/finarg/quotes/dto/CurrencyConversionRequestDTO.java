package com.finarg.quotes.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyConversionRequestDTO {

    @NotBlank(message = "From country is required")
    private String fromCountry;

    @NotBlank(message = "From currency is required")
    private String fromCurrency;

    @NotBlank(message = "To country is required")
    private String toCountry;

    @NotBlank(message = "To currency is required")
    private String toCurrency;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
    private BigDecimal amount;

    @NotNull(message = "From price type is required")
    private PriceType fromPriceType;

    @NotNull(message = "To price type is required")
    private PriceType toPriceType;

    public enum PriceType {
        BUY,
        SELL
    }
}
