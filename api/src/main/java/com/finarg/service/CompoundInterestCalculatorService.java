package com.finarg.service;

import com.finarg.model.dto.CompoundInterestRequestDTO;
import com.finarg.model.dto.CompoundInterestResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompoundInterestCalculatorService {

    public CompoundInterestResponseDTO calculate(CompoundInterestRequestDTO request) {
        int periodsPerYear = request.getCompoundingFrequency().getPeriodsPerYear();
        int totalPeriods = request.getYears() * periodsPerYear;

        BigDecimal ratePerPeriod = request.getAnnualRate()
                .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(periodsPerYear), 10, RoundingMode.HALF_UP);

        BigDecimal periodicContribution = request.getPeriodicContribution() != null
                ? request.getPeriodicContribution()
                : BigDecimal.ZERO;

        List<CompoundInterestResponseDTO.PeriodDetail> periods = new ArrayList<>();
        BigDecimal principal = request.getInitialCapital();
        BigDecimal totalContributions = request.getInitialCapital();

        int monthCounter = 0;
        for (int i = 1; i <= totalPeriods; i++) {
            BigDecimal interest = principal.multiply(ratePerPeriod);
            principal = principal.add(interest).add(periodicContribution);
            totalContributions = totalContributions.add(periodicContribution);

            monthCounter++;
            if (monthCounter >= (12 / periodsPerYear) || i == totalPeriods) {
                BigDecimal contributionsMinusInitial = totalContributions.subtract(request.getInitialCapital());
                BigDecimal currentInterest = principal.subtract(totalContributions);

                int monthNumber = (i * 12) / periodsPerYear;
                periods.add(CompoundInterestResponseDTO.PeriodDetail.builder()
                        .period(monthNumber)
                        .principal(contributionsMinusInitial)
                        .interest(currentInterest)
                        .total(principal)
                        .build());
                monthCounter = 0;
            }
        }

        BigDecimal finalAmount = principal;
        BigDecimal totalInterest = finalAmount.subtract(totalContributions);

        return CompoundInterestResponseDTO.builder()
                .finalAmount(finalAmount.setScale(2, RoundingMode.HALF_UP))
                .totalContributions(totalContributions.setScale(2, RoundingMode.HALF_UP))
                .totalInterest(totalInterest.setScale(2, RoundingMode.HALF_UP))
                .periods(periods)
                .build();
    }
}
