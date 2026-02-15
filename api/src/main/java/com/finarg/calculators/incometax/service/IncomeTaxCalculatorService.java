package com.finarg.calculators.incometax.service;

import com.finarg.calculators.incometax.dto.IncomeTaxRequestDTO;
import com.finarg.calculators.incometax.dto.IncomeTaxResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class IncomeTaxCalculatorService {

    private static final int SALARY_PAYMENTS_PER_YEAR = 13;
    private static final int MONTHS_PER_YEAR = 12;
    private static final BigDecimal HEALTH_INSURANCE_RATE = new BigDecimal("0.03");
    private static final BigDecimal RETIREMENT_RATE = new BigDecimal("0.11");
    private static final BigDecimal MAX_DEDUCTION_RATE = new BigDecimal("0.40");
    private static final BigDecimal PERCENTAGE_DIVISOR = BigDecimal.valueOf(100);
    private static final BigDecimal MAX_TAXABLE_INCOME = new BigDecimal("999999999999");

    private static final BigDecimal ANNUAL_MINIMUM_EXEMPTION = new BigDecimal("4211886.94");
    private static final BigDecimal SPECIAL_DEDUCTION_4TH = new BigDecimal("20217057.35");
    private static final BigDecimal SPOUSE_ALLOWANCE = new BigDecimal("3966752.72");
    private static final BigDecimal CHILD_ALLOWANCE = new BigDecimal("2000447.87");
    private static final BigDecimal CHILD_DISABILITY_ALLOWANCE = new BigDecimal("4000895.74");
    private static final BigDecimal LIFE_INSURANCE_ANNUAL_CAP = new BigDecimal("573817.13");

    private static final List<TaxBracketScale> SCALES = List.of(
            new TaxBracketScale(BigDecimal.ZERO, new BigDecimal("1749901.45"), new BigDecimal("5")),
            new TaxBracketScale(new BigDecimal("1749901.45"), new BigDecimal("3499802.89"), new BigDecimal("9")),
            new TaxBracketScale(new BigDecimal("3499802.89"), new BigDecimal("5249704.34"), new BigDecimal("12")),
            new TaxBracketScale(new BigDecimal("5249704.34"), new BigDecimal("7874556.52"), new BigDecimal("15")),
            new TaxBracketScale(new BigDecimal("7874556.52"), new BigDecimal("15749113.04"), new BigDecimal("19")),
            new TaxBracketScale(new BigDecimal("15749113.04"), new BigDecimal("23623669.56"), new BigDecimal("23")),
            new TaxBracketScale(new BigDecimal("23623669.56"), new BigDecimal("35435504.34"), new BigDecimal("27")),
            new TaxBracketScale(new BigDecimal("35435504.34"), new BigDecimal("53153256.52"), new BigDecimal("31")),
            new TaxBracketScale(new BigDecimal("53153256.52"), MAX_TAXABLE_INCOME, new BigDecimal("35"))
    );

    public IncomeTaxResponseDTO calculate(IncomeTaxRequestDTO request) {
        BigDecimal grossAnnualSalary = request.getGrossMonthlySalary().multiply(BigDecimal.valueOf(SALARY_PAYMENTS_PER_YEAR));

        LegalDeductions legalDeductions = calculateLegalDeductions(request, grossAnnualSalary);
        BigDecimal familyAllowances = calculateFamilyAllowances(request);
        BigDecimal personalDeductions = calculatePersonalDeductions(request, grossAnnualSalary);

        BigDecimal legalNetIncome = grossAnnualSalary.subtract(legalDeductions.total);
        BigDecimal totalAllowedDeductions = ANNUAL_MINIMUM_EXEMPTION
                .add(SPECIAL_DEDUCTION_4TH)
                .add(familyAllowances)
                .add(personalDeductions);

        BigDecimal taxableIncome = legalNetIncome.subtract(totalAllowedDeductions);
        if (taxableIncome.compareTo(BigDecimal.ZERO) < 0) {
            taxableIncome = BigDecimal.ZERO;
        }

        TaxCalculationResult taxResult = calculateTaxByBrackets(taxableIncome);

        return buildResponse(request, grossAnnualSalary, legalDeductions, familyAllowances,
                personalDeductions, totalAllowedDeductions, taxableIncome, taxResult);
    }

    private LegalDeductions calculateLegalDeductions(IncomeTaxRequestDTO request, BigDecimal grossAnnualSalary) {
        BigDecimal retirement = request.isRetired()
                ? BigDecimal.ZERO
                : calculateRetirement(request.getRetirement(), grossAnnualSalary);
        BigDecimal healthInsurance = request.isRetired()
                ? BigDecimal.ZERO
                : calculateHealthInsurance(request.getHealthInsurance(), grossAnnualSalary);
        BigDecimal law19032 = request.isRetired()
                ? BigDecimal.ZERO
                : grossAnnualSalary.multiply(HEALTH_INSURANCE_RATE);
        BigDecimal unionDues = calculateUnionDues(
                request.getUnionDues(), request.getUnionDuesPercent(), grossAnnualSalary);

        BigDecimal total = retirement.add(healthInsurance).add(law19032).add(unionDues);
        return new LegalDeductions(retirement, healthInsurance, law19032, unionDues, total);
    }

    private BigDecimal calculateFamilyAllowances(IncomeTaxRequestDTO request) {
        BigDecimal allowances = BigDecimal.ZERO;
        if (request.isHasSpouse()) {
            allowances = allowances.add(SPOUSE_ALLOWANCE);
        }
        int disabledCount = Math.min(
                Math.max(0, request.getChildrenWithDisabilitiesCount()), request.getNumberOfChildren());
        int regularChildren = Math.max(0, request.getNumberOfChildren() - disabledCount);
        allowances = allowances.add(CHILD_ALLOWANCE.multiply(BigDecimal.valueOf(regularChildren)));
        allowances = allowances.add(CHILD_DISABILITY_ALLOWANCE.multiply(BigDecimal.valueOf(disabledCount)));
        return allowances;
    }

    private BigDecimal calculatePersonalDeductions(IncomeTaxRequestDTO request, BigDecimal grossAnnualSalary) {
        BigDecimal deductions = BigDecimal.ZERO;
        if (request.getHousingRent() != null) {
            BigDecimal maxRent = grossAnnualSalary.multiply(MAX_DEDUCTION_RATE);
            deductions = deductions.add(
                    request.getHousingRent().multiply(BigDecimal.valueOf(MONTHS_PER_YEAR)).min(maxRent));
        }
        if (request.getDomesticService() != null) {
            deductions = deductions.add(
                    request.getDomesticService().multiply(BigDecimal.valueOf(MONTHS_PER_YEAR)).min(ANNUAL_MINIMUM_EXEMPTION));
        }
        if (request.getEducationExpenses() != null) {
            BigDecimal maxEducation = grossAnnualSalary.multiply(MAX_DEDUCTION_RATE);
            deductions = deductions.add(
                    request.getEducationExpenses().multiply(BigDecimal.valueOf(MONTHS_PER_YEAR)).min(maxEducation));
        }
        if (request.getLifeInsurance() != null && request.getLifeInsurance().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal annualLife = request.getLifeInsurance().multiply(BigDecimal.valueOf(MONTHS_PER_YEAR));
            deductions = deductions.add(annualLife.min(LIFE_INSURANCE_ANNUAL_CAP));
        }
        return deductions;
    }

    private TaxCalculationResult calculateTaxByBrackets(BigDecimal taxableIncome) {
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
                    .divide(PERCENTAGE_DIVISOR, 2, RoundingMode.HALF_UP);

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
        return new TaxCalculationResult(totalTax, breakdown);
    }

    private IncomeTaxResponseDTO buildResponse(IncomeTaxRequestDTO request, BigDecimal grossAnnualSalary,
            LegalDeductions legalDeductions, BigDecimal familyAllowances, BigDecimal personalDeductions,
            BigDecimal totalAllowedDeductions, BigDecimal taxableIncome, TaxCalculationResult taxResult) {

        BigDecimal monthlyTax = taxResult.totalTax.divide(BigDecimal.valueOf(MONTHS_PER_YEAR), 2, RoundingMode.HALF_UP);
        BigDecimal monthlyLegal = legalDeductions.total.divide(BigDecimal.valueOf(MONTHS_PER_YEAR), 2, RoundingMode.HALF_UP);
        BigDecimal netMonthlySalary = request.getGrossMonthlySalary()
                .subtract(monthlyLegal)
                .subtract(monthlyTax);
        BigDecimal effectiveRate = calculateEffectiveRate(grossAnnualSalary, taxResult.totalTax);
        BigDecimal div12 = BigDecimal.valueOf(MONTHS_PER_YEAR);

        return IncomeTaxResponseDTO.builder()
                .grossMonthlySalary(request.getGrossMonthlySalary().setScale(2, RoundingMode.HALF_UP))
                .grossAnnualSalary(grossAnnualSalary.setScale(2, RoundingMode.HALF_UP))
                .monthlyLegalDeductions(monthlyLegal)
                .totalDeductions(legalDeductions.total.add(totalAllowedDeductions).setScale(2, RoundingMode.HALF_UP))
                .taxableIncome(taxableIncome.setScale(2, RoundingMode.HALF_UP))
                .annualTax(taxResult.totalTax.setScale(2, RoundingMode.HALF_UP))
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
                .deductionBreakdown(IncomeTaxResponseDTO.DeductionBreakdown.builder()
                        .retirement(legalDeductions.retirement.divide(div12, 2, RoundingMode.HALF_UP))
                        .healthInsurance(legalDeductions.healthInsurance.divide(div12, 2, RoundingMode.HALF_UP))
                        .law19032(legalDeductions.law19032.divide(div12, 2, RoundingMode.HALF_UP))
                        .unionDues(legalDeductions.unionDues.divide(div12, 2, RoundingMode.HALF_UP))
                        .incomeTax(monthlyTax)
                        .total(monthlyLegal.add(monthlyTax))
                        .build())
                .taxBrackets(taxResult.breakdown)
                .build();
    }

    private record LegalDeductions(BigDecimal retirement, BigDecimal healthInsurance,
                                   BigDecimal law19032, BigDecimal unionDues, BigDecimal total) { }

    private record TaxCalculationResult(BigDecimal totalTax,
                                        List<IncomeTaxResponseDTO.TaxBracket> breakdown) { }

    private record TaxBracketScale(BigDecimal from, BigDecimal to, BigDecimal rate) { }

    private BigDecimal calculateRetirement(BigDecimal retirement, BigDecimal grossAnnualSalary) {
        if (retirement != null) {
            return retirement.multiply(BigDecimal.valueOf(MONTHS_PER_YEAR));
        }
        return grossAnnualSalary.multiply(RETIREMENT_RATE);
    }

    private BigDecimal calculateHealthInsurance(BigDecimal healthInsurance, BigDecimal grossAnnualSalary) {
        if (healthInsurance != null) {
            return healthInsurance.multiply(BigDecimal.valueOf(MONTHS_PER_YEAR));
        }
        return grossAnnualSalary.multiply(HEALTH_INSURANCE_RATE);
    }

    private BigDecimal calculateUnionDues(BigDecimal unionDues, BigDecimal unionDuesPercent, BigDecimal grossAnnualSalary) {
        if (unionDuesPercent != null && unionDuesPercent.compareTo(BigDecimal.ZERO) > 0) {
            return grossAnnualSalary.multiply(unionDuesPercent).divide(PERCENTAGE_DIVISOR, 2, RoundingMode.HALF_UP);
        }
        if (unionDues != null) {
            return unionDues.multiply(BigDecimal.valueOf(MONTHS_PER_YEAR));
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateEffectiveRate(BigDecimal grossAnnualSalary, BigDecimal totalTax) {
        if (grossAnnualSalary.compareTo(BigDecimal.ZERO) > 0) {
            return totalTax.divide(grossAnnualSalary, 4, RoundingMode.HALF_UP)
                    .multiply(PERCENTAGE_DIVISOR);
        }
        return BigDecimal.ZERO;
    }
}
