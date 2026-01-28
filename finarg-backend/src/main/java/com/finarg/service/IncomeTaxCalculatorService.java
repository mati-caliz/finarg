package com.finarg.service;

import com.finarg.model.dto.IncomeTaxRequestDTO;
import com.finarg.model.dto.IncomeTaxResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class IncomeTaxCalculatorService {

    private static final BigDecimal ANNUAL_MINIMUM_EXEMPTION = new BigDecimal("3091035");
    private static final BigDecimal SPECIAL_DEDUCTION_4TH = new BigDecimal("14837448");
    private static final BigDecimal SPOUSE_ALLOWANCE = new BigDecimal("2911135");
    private static final BigDecimal CHILD_ALLOWANCE = new BigDecimal("1468096");
    
    private static final List<TaxBracketScale> SCALES = List.of(
            new TaxBracketScale(BigDecimal.ZERO, new BigDecimal("1193521"), new BigDecimal("5")),
            new TaxBracketScale(new BigDecimal("1193521"), new BigDecimal("2387043"), new BigDecimal("9")),
            new TaxBracketScale(new BigDecimal("2387043"), new BigDecimal("3580564"), new BigDecimal("12")),
            new TaxBracketScale(new BigDecimal("3580564"), new BigDecimal("5371347"), new BigDecimal("15")),
            new TaxBracketScale(new BigDecimal("5371347"), new BigDecimal("10742695"), new BigDecimal("19")),
            new TaxBracketScale(new BigDecimal("10742695"), new BigDecimal("16114042"), new BigDecimal("23")),
            new TaxBracketScale(new BigDecimal("16114042"), new BigDecimal("24171563"), new BigDecimal("27")),
            new TaxBracketScale(new BigDecimal("24171563"), new BigDecimal("48343127"), new BigDecimal("31")),
            new TaxBracketScale(new BigDecimal("48343127"), new BigDecimal("999999999999"), new BigDecimal("35"))
    );

    public IncomeTaxResponseDTO calculate(IncomeTaxRequestDTO request) {
        log.info("Calculating income tax for salary: {}", request.getGrossMonthlySalary());

        BigDecimal grossAnnualSalary = request.getGrossMonthlySalary().multiply(BigDecimal.valueOf(13));
        
        BigDecimal retirement = calculateRetirement(request.getRetirement(), grossAnnualSalary);
        BigDecimal healthInsurance = calculateHealthInsurance(request.getHealthInsurance(), grossAnnualSalary);
        BigDecimal unionDues = calculateUnionDues(request.getUnionDues());

        BigDecimal familyAllowances = BigDecimal.ZERO;
        if (request.isHasSpouse()) {
            familyAllowances = familyAllowances.add(SPOUSE_ALLOWANCE);
        }
        familyAllowances = familyAllowances.add(CHILD_ALLOWANCE.multiply(BigDecimal.valueOf(request.getNumberOfChildren())));

        BigDecimal personalDeductions = BigDecimal.ZERO;
        if (request.getHousingRent() != null) {
            BigDecimal maxRent = grossAnnualSalary.multiply(new BigDecimal("0.40"));
            personalDeductions = personalDeductions.add(
                    request.getHousingRent().multiply(BigDecimal.valueOf(12)).min(maxRent)
            );
        }
        if (request.getDomesticService() != null) {
            personalDeductions = personalDeductions.add(
                    request.getDomesticService().multiply(BigDecimal.valueOf(12)).min(ANNUAL_MINIMUM_EXEMPTION)
            );
        }
        if (request.getEducationExpenses() != null) {
            BigDecimal maxEducation = grossAnnualSalary.multiply(new BigDecimal("0.40"));
            personalDeductions = personalDeductions.add(
                    request.getEducationExpenses().multiply(BigDecimal.valueOf(12)).min(maxEducation)
            );
        }

        BigDecimal totalLegalDeductions = retirement.add(healthInsurance).add(unionDues);
        BigDecimal legalNetIncome = grossAnnualSalary.subtract(totalLegalDeductions);

        BigDecimal totalAllowedDeductions = ANNUAL_MINIMUM_EXEMPTION
                .add(SPECIAL_DEDUCTION_4TH)
                .add(familyAllowances)
                .add(personalDeductions);

        BigDecimal taxableIncome = legalNetIncome.subtract(totalAllowedDeductions);
        
        if (taxableIncome.compareTo(BigDecimal.ZERO) < 0) {
            taxableIncome = BigDecimal.ZERO;
        }

        List<IncomeTaxResponseDTO.TaxBracket> breakdown = new ArrayList<>();
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal remainingBase = taxableIncome;
        int bracketNum = 1;

        for (TaxBracketScale scale : SCALES) {
            if (remainingBase.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal bracketRange = scale.to.subtract(scale.from);
            BigDecimal bracketBase = remainingBase.min(bracketRange);
            BigDecimal bracketTax = bracketBase.multiply(scale.rate)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (bracketBase.compareTo(BigDecimal.ZERO) > 0) {
                breakdown.add(IncomeTaxResponseDTO.TaxBracket.builder()
                        .bracket(bracketNum++)
                        .from(scale.from)
                        .to(scale.to)
                        .rate(scale.rate)
                        .taxableBase(bracketBase)
                        .bracketTax(bracketTax)
                        .build());
            }

            totalTax = totalTax.add(bracketTax);
            remainingBase = remainingBase.subtract(bracketRange);
        }

        BigDecimal monthlyTax = totalTax.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        BigDecimal netMonthlySalary = request.getGrossMonthlySalary()
                .subtract(totalLegalDeductions.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP))
                .subtract(monthlyTax);

        BigDecimal effectiveRate = calculateEffectiveRate(grossAnnualSalary, totalTax);

        return IncomeTaxResponseDTO.builder()
                .grossAnnualSalary(grossAnnualSalary.setScale(2, RoundingMode.HALF_UP))
                .totalDeductions(totalLegalDeductions.add(totalAllowedDeductions).setScale(2, RoundingMode.HALF_UP))
                .taxableIncome(taxableIncome.setScale(2, RoundingMode.HALF_UP))
                .annualTax(totalTax.setScale(2, RoundingMode.HALF_UP))
                .monthlyTax(monthlyTax)
                .effectiveRate(effectiveRate.setScale(2, RoundingMode.HALF_UP))
                .netMonthlySalary(netMonthlySalary.setScale(2, RoundingMode.HALF_UP))
                .calculationDetails(IncomeTaxResponseDTO.CalculationDetails.builder()
                        .minimumExemption(ANNUAL_MINIMUM_EXEMPTION)
                        .specialDeduction(SPECIAL_DEDUCTION_4TH)
                        .familyAllowances(familyAllowances)
                        .personalDeductions(personalDeductions)
                        .totalAllowedDeductions(totalAllowedDeductions)
                        .build())
                .taxBrackets(breakdown)
                .build();
    }

    private record TaxBracketScale(BigDecimal from, BigDecimal to, BigDecimal rate) { }

    private BigDecimal calculateRetirement(BigDecimal retirement, BigDecimal grossAnnualSalary) {
        if (retirement != null) {
            return retirement.multiply(BigDecimal.valueOf(12));
        }
        return grossAnnualSalary.multiply(new BigDecimal("0.11"));
    }

    private BigDecimal calculateHealthInsurance(BigDecimal healthInsurance, BigDecimal grossAnnualSalary) {
        if (healthInsurance != null) {
            return healthInsurance.multiply(BigDecimal.valueOf(12));
        }
        return grossAnnualSalary.multiply(new BigDecimal("0.03"));
    }

    private BigDecimal calculateUnionDues(BigDecimal unionDues) {
        if (unionDues != null) {
            return unionDues.multiply(BigDecimal.valueOf(12));
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateEffectiveRate(BigDecimal grossAnnualSalary, BigDecimal totalTax) {
        if (grossAnnualSalary.compareTo(BigDecimal.ZERO) > 0) {
            return totalTax.divide(grossAnnualSalary, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }
}
