package com.finarg.quotes.dto;

import com.finarg.shared.enums.Country;
import com.finarg.shared.enums.GapLevel;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GapDTO implements Serializable {
    private Country country;
    private BigDecimal officialRate;
    private BigDecimal parallelRate;
    private BigDecimal gapPercentage;
    private GapLevel level;
    private String trafficLightColor;
    private String description;
}
