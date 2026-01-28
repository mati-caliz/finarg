package com.finarg.service;

import com.finarg.client.ArgentinaDatosClient;
import com.finarg.model.dto.InflationAdjustmentDTO;
import com.finarg.model.dto.InflationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InflationService {

    private final ArgentinaDatosClient argentinaDatosClient;

    @Cacheable(value = "inflation", key = "'monthly_' + #limit")
    public List<InflationDTO> getMonthlyInflation(int limit) {
        log.info("Fetching monthly inflation, limit: {}", limit);
        return argentinaDatosClient.getMonthlyInflation(limit);
    }

    @Cacheable(value = "inflation", key = "'current'")
    public InflationDTO getCurrentInflation() {
        List<InflationDTO> inflations = argentinaDatosClient.getMonthlyInflation(1);
        if (inflations.isEmpty()) {
            return InflationDTO.builder()
                    .date(LocalDate.now())
                    .value(BigDecimal.ZERO)
                    .build();
        }
        return inflations.get(0);
    }

    @Cacheable(value = "inflation", key = "'year_over_year'")
    public List<InflationDTO> getYearOverYearInflation() {
        return argentinaDatosClient.getYearOverYearInflation();
    }

    public InflationAdjustmentDTO adjustForInflation(BigDecimal originalAmount,
                                                     LocalDate fromDate,
                                                     LocalDate toDate) {
        log.info("Adjusting for inflation: {} from {} to {}", originalAmount, fromDate, toDate);

        List<InflationDTO> inflations = argentinaDatosClient.getMonthlyInflation(120);
        
        BigDecimal accumulatedFactor = BigDecimal.ONE;

        for (InflationDTO inf : inflations) {
            if (inf.getDate() != null
                    && !inf.getDate().isBefore(fromDate)
                    && !inf.getDate().isAfter(toDate)) {
                
                BigDecimal monthFactor = BigDecimal.ONE.add(
                        inf.getValue().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)
                );
                accumulatedFactor = accumulatedFactor.multiply(monthFactor);
            }
        }

        BigDecimal adjustedAmount = originalAmount.multiply(accumulatedFactor)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal cumulativeInflation = accumulatedFactor.subtract(BigDecimal.ONE)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);

        int monthsElapsed = (int) ChronoUnit.MONTHS.between(fromDate, toDate);

        return InflationAdjustmentDTO.builder()
                .originalAmount(originalAmount)
                .adjustedAmount(adjustedAmount)
                .fromDate(fromDate)
                .toDate(toDate)
                .cumulativeInflation(cumulativeInflation)
                .monthsElapsed(monthsElapsed)
                .build();
    }
}
