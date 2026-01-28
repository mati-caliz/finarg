package com.finarg.model.dto;

import com.finarg.model.enums.InvestmentType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationRequestDTO {
    
    @NotNull(message = "Initial amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal initialAmount;
    
    @NotNull(message = "Investment type is required")
    private InvestmentType investmentType;
    
    @NotNull(message = "Term is required")
    @Min(value = 1, message = "Minimum term is 1 day")
    @Max(value = 365, message = "Maximum term is 365 days")
    private Integer termDays;
    
    private boolean reinvest;
    private BigDecimal customRate;
}
