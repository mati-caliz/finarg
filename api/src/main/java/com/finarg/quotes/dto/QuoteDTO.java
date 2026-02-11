package com.finarg.quotes.dto;

import com.finarg.shared.enums.Country;
import com.finarg.shared.enums.CurrencyType;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteDTO implements Serializable {
    private CurrencyType type;
    private Country country;
    private String name;
    private BigDecimal buy;
    private BigDecimal sell;
    private BigDecimal spread;
    private BigDecimal variation;
    private LocalDateTime lastUpdate;
    private String baseCurrency;
    private Boolean hasHistory;
}
