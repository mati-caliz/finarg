package com.finarg.realestate.service;

import com.finarg.realestate.dto.ROIRequestDTO;
import com.finarg.realestate.dto.ROIResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Slf4j
@Service
public class RealEstateROICalculatorService {

    public ROIResponseDTO calculateROI(ROIRequestDTO request) {
        log.info("Calculating ROI for property price: {}", request.propertyPrice());

        ROIResponseDTO.BuyScenarioDTO buyScenario = calculateBuyScenario(request);
        ROIResponseDTO.RentScenarioDTO rentScenario = calculateRentScenario(request);
        ROIResponseDTO.ComparisonDTO comparison = compareScenarios(buyScenario, rentScenario, request);
        Integer breakEvenYear = calculateBreakEvenYear(request);
        String recommendation = generateRecommendation(comparison, request);

        return ROIResponseDTO.builder()
            .buyScenario(buyScenario)
            .rentScenario(rentScenario)
            .comparison(comparison)
            .breakEvenYear(breakEvenYear)
            .recommendation(recommendation)
            .calculatedAt(LocalDateTime.now())
            .build();
    }

    private ROIResponseDTO.BuyScenarioDTO calculateBuyScenario(ROIRequestDTO request) {
        BigDecimal downPayment = request.propertyPrice()
            .multiply(request.downPaymentPercent())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal mortgageAmount = request.propertyPrice().subtract(downPayment);

        BigDecimal monthlyMortgagePayment = calculateMonthlyMortgagePayment(
            mortgageAmount,
            request.mortgageInterestRate(),
            request.mortgageYears()
        );

        BigDecimal totalMortgageInterest = monthlyMortgagePayment
            .multiply(BigDecimal.valueOf(request.mortgageYears() * 12))
            .subtract(mortgageAmount);

        BigDecimal propertyValueAtEnd = calculatePropertyValueAtEnd(
            request.propertyPrice(),
            request.annualAppreciationPercent(),
            request.analysisYears()
        );

        BigDecimal totalPropertyTaxPaid = request.annualPropertyTax()
            .multiply(BigDecimal.valueOf(request.analysisYears()));

        BigDecimal totalMaintenancePaid = request.annualMaintenanceCosts()
            .multiply(BigDecimal.valueOf(request.analysisYears()));

        BigDecimal totalEquityBuilt = propertyValueAtEnd.subtract(mortgageAmount);

        BigDecimal netWorthAtEnd = propertyValueAtEnd
            .subtract(totalPropertyTaxPaid)
            .subtract(totalMaintenancePaid)
            .subtract(totalMortgageInterest);

        BigDecimal totalCostOverYears = downPayment
            .add(totalMortgageInterest)
            .add(totalPropertyTaxPaid)
            .add(totalMaintenancePaid);

        BigDecimal annualizedROI = calculateAnnualizedROI(
            downPayment,
            netWorthAtEnd,
            request.analysisYears()
        );

        return ROIResponseDTO.BuyScenarioDTO.builder()
            .totalInitialCost(downPayment)
            .downPayment(downPayment)
            .mortgageAmount(mortgageAmount)
            .monthlyMortgagePayment(monthlyMortgagePayment)
            .totalMortgageInterest(totalMortgageInterest)
            .totalPropertyTaxPaid(totalPropertyTaxPaid)
            .totalMaintenancePaid(totalMaintenancePaid)
            .propertyValueAtEnd(propertyValueAtEnd)
            .totalEquityBuilt(totalEquityBuilt)
            .netWorthAtEnd(netWorthAtEnd)
            .totalCostOverYears(totalCostOverYears)
            .annualizedROI(annualizedROI)
            .build();
    }

    private ROIResponseDTO.RentScenarioDTO calculateRentScenario(ROIRequestDTO request) {
        BigDecimal totalRentPaid = request.monthlyRent()
            .multiply(BigDecimal.valueOf(12))
            .multiply(BigDecimal.valueOf(request.analysisYears()));

        BigDecimal totalExpensesPaid = request.monthlyExpenses()
            .multiply(BigDecimal.valueOf(12))
            .multiply(BigDecimal.valueOf(request.analysisYears()));

        BigDecimal downPaymentSaved = request.propertyPrice()
            .multiply(request.downPaymentPercent())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal investmentReturns = calculateInvestmentReturns(
            downPaymentSaved,
            request.annualAppreciationPercent(),
            request.analysisYears()
        );

        BigDecimal investmentValue = downPaymentSaved.add(investmentReturns);

        BigDecimal netWorthAtEnd = investmentValue;

        BigDecimal totalCostOverYears = totalRentPaid.add(totalExpensesPaid);

        return ROIResponseDTO.RentScenarioDTO.builder()
            .totalRentPaid(totalRentPaid)
            .totalExpensesPaid(totalExpensesPaid)
            .investmentValue(investmentValue)
            .investmentReturns(investmentReturns)
            .netWorthAtEnd(netWorthAtEnd)
            .totalCostOverYears(totalCostOverYears)
            .build();
    }

    private ROIResponseDTO.ComparisonDTO compareScenarios(
            ROIResponseDTO.BuyScenarioDTO buyScenario,
            ROIResponseDTO.RentScenarioDTO rentScenario,
            ROIRequestDTO request) {

        BigDecimal netWorthDifference = buyScenario.netWorthAtEnd()
            .subtract(rentScenario.netWorthAtEnd());

        BigDecimal percentageDifference = BigDecimal.ZERO;
        if (rentScenario.netWorthAtEnd().compareTo(BigDecimal.ZERO) > 0) {
            percentageDifference = netWorthDifference
                .divide(rentScenario.netWorthAtEnd(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        }

        String betterOption = netWorthDifference.compareTo(BigDecimal.ZERO) >= 0 ? "BUY" : "RENT";

        BigDecimal buyMonthlyCost = buyScenario.monthlyMortgagePayment()
            .add(request.annualPropertyTax().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP))
            .add(request.annualMaintenanceCosts().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP));

        BigDecimal rentMonthlyCost = request.monthlyRent().add(request.monthlyExpenses());

        BigDecimal monthlyCostDifference = buyMonthlyCost.subtract(rentMonthlyCost);

        return ROIResponseDTO.ComparisonDTO.builder()
            .netWorthDifference(netWorthDifference)
            .percentageDifference(percentageDifference)
            .betterOption(betterOption)
            .monthlyCostDifference(monthlyCostDifference)
            .build();
    }

    private BigDecimal calculateMonthlyMortgagePayment(
            BigDecimal principal,
            BigDecimal annualRate,
            Integer years) {

        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            return principal.divide(BigDecimal.valueOf(years * 12), 2, RoundingMode.HALF_UP);
        }

        BigDecimal monthlyRate = annualRate
            .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)
            .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);

        int numberOfPayments = years * 12;

        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
        BigDecimal onePlusRPowerN = onePlusR.pow(numberOfPayments);

        BigDecimal numerator = principal.multiply(monthlyRate).multiply(onePlusRPowerN);
        BigDecimal denominator = onePlusRPowerN.subtract(BigDecimal.ONE);

        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculatePropertyValueAtEnd(
            BigDecimal initialValue,
            BigDecimal annualAppreciation,
            Integer years) {

        BigDecimal appreciationRate = BigDecimal.ONE.add(
            annualAppreciation.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)
        );

        BigDecimal finalValue = initialValue;
        for (int i = 0; i < years; i++) {
            finalValue = finalValue.multiply(appreciationRate);
        }

        return finalValue.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateInvestmentReturns(
            BigDecimal principal,
            BigDecimal annualReturn,
            Integer years) {

        BigDecimal returnRate = BigDecimal.ONE.add(
            annualReturn.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)
        );

        BigDecimal finalValue = principal;
        for (int i = 0; i < years; i++) {
            finalValue = finalValue.multiply(returnRate);
        }

        return finalValue.subtract(principal).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateAnnualizedROI(
            BigDecimal initialInvestment,
            BigDecimal finalValue,
            Integer years) {

        if (initialInvestment.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalReturn = finalValue.subtract(initialInvestment);
        BigDecimal roi = totalReturn.divide(initialInvestment, 4, RoundingMode.HALF_UP);

        BigDecimal annualizedROI = roi
            .divide(BigDecimal.valueOf(years), 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100));

        return annualizedROI.setScale(2, RoundingMode.HALF_UP);
    }

    private Integer calculateBreakEvenYear(ROIRequestDTO request) {
        BigDecimal downPayment = request.propertyPrice()
            .multiply(request.downPaymentPercent())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal mortgageAmount = request.propertyPrice().subtract(downPayment);

        BigDecimal monthlyMortgagePayment = calculateMonthlyMortgagePayment(
            mortgageAmount,
            request.mortgageInterestRate(),
            request.mortgageYears()
        );

        BigDecimal buyMonthlyCost = monthlyMortgagePayment
            .add(request.annualPropertyTax().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP))
            .add(request.annualMaintenanceCosts().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP));

        BigDecimal rentMonthlyCost = request.monthlyRent().add(request.monthlyExpenses());

        BigDecimal monthlySavings = rentMonthlyCost.subtract(buyMonthlyCost);

        if (monthlySavings.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        BigDecimal monthsToBreakEven = downPayment.divide(monthlySavings, 2, RoundingMode.HALF_UP);

        return monthsToBreakEven.divide(BigDecimal.valueOf(12), 0, RoundingMode.UP).intValue();
    }

    private String generateRecommendation(
            ROIResponseDTO.ComparisonDTO comparison,
            ROIRequestDTO request) {

        if (comparison.betterOption().equals("BUY")) {
            return String.format(
                "Comprar es la mejor opción. Tendrás %s más de patrimonio neto después de %d años. "
                    + "El costo mensual de comprar es %s %s que alquilar.",
                formatCurrency(comparison.netWorthDifference().abs(), request.currency()),
                request.analysisYears(),
                comparison.monthlyCostDifference().compareTo(BigDecimal.ZERO) > 0 ? "mayor" : "menor",
                formatCurrency(comparison.monthlyCostDifference().abs(), request.currency())
            );
        } else {
            return String.format(
                "Alquilar es la mejor opción. Tendrás %s más de patrimonio neto después de %d años "
                    + "al invertir la diferencia. El costo mensual de alquilar es %s menor que comprar.",
                formatCurrency(comparison.netWorthDifference().abs(), request.currency()),
                request.analysisYears(),
                formatCurrency(comparison.monthlyCostDifference().abs(), request.currency())
            );
        }
    }

    private String formatCurrency(BigDecimal amount, String currency) {
        return String.format("%s %,.2f", currency, amount);
    }
}
