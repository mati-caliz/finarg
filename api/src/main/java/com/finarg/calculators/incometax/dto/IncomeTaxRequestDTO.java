package com.finarg.calculators.incometax.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomeTaxRequestDTO {
    
    @NotNull(message = "Gross monthly salary is required")
    @Positive(message = "Gross monthly salary must be positive")
    private BigDecimal grossMonthlySalary;

    @JsonProperty("isRetired")
    private boolean retired;

    private BigDecimal healthInsurance;
    private BigDecimal retirement;
    private BigDecimal unionDues;

    @JsonProperty("unionDuesPercent")
    private BigDecimal unionDuesPercent;

    private boolean hasSpouse;

    @JsonProperty("childrenCount")
    private int numberOfChildren;

    @JsonProperty("childrenWithDisabilitiesCount")
    private int childrenWithDisabilitiesCount;
    
    private BigDecimal housingRent;
    private BigDecimal domesticService;
    private BigDecimal educationExpenses;
    private BigDecimal lifeInsurance;
    private BigDecimal donations;
    private BigDecimal medicalFees;
    
    private List<CustomDeduction> otherDeductions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomDeduction {
        private String concept;
        private BigDecimal amount;
    }
}
