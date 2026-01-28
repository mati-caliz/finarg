package com.finarg.model.dto;

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
    
    @NotNull(message = "Employee type is required")
    private EmployeeType employeeType;
    
    private BigDecimal healthInsurance;
    private BigDecimal retirement;
    private BigDecimal unionDues;
    
    private boolean hasSpouse;
    private int numberOfChildren;
    
    private BigDecimal housingRent;
    private BigDecimal domesticService;
    private BigDecimal educationExpenses;
    private BigDecimal lifeInsurance;
    private BigDecimal donations;
    private BigDecimal medicalFees;
    
    private List<CustomDeduction> otherDeductions;
    
    public enum EmployeeType {
        EMPLOYEE,
        SELF_EMPLOYED
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomDeduction {
        private String concept;
        private BigDecimal amount;
    }
}
