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
        int fetchLimit = limit + 12;
        List<InflationDTO> list = argentinaDatosClient.getMonthlyInflation(fetchLimit);
        if (list == null || list.isEmpty()) {
            return list;
        }
        for (int i = 0; i < list.size(); i++) {
            if (i + 12 <= list.size()) {
                BigDecimal yoy = calculateYearOverYear(list.subList(i, i + 12));
                list.get(i).setYearOverYear(yoy);
            }
            BigDecimal ytd = calculateYearToDateForMonth(list, i);
            list.get(i).setYearToDate(ytd);
        }
        int returnSize = Math.min(limit, list.size());
        return list.subList(0, returnSize);
    }

    private BigDecimal calculateYearToDateForMonth(List<InflationDTO> list, int index) {
        LocalDate targetDate = list.get(index).getDate();
        if (targetDate == null) {
            return BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        }
        int year = targetDate.getYear();
        BigDecimal accumulated = BigDecimal.ONE;
        for (InflationDTO inf : list) {
            if (inf.getDate() == null || inf.getDate().getYear() != year) {
                continue;
            }
            if (inf.getDate().isAfter(targetDate)) {
                continue;
            }
            if (inf.getValue() == null) {
                continue;
            }
            BigDecimal factor = BigDecimal.ONE.add(
                    inf.getValue().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)
            );
            accumulated = accumulated.multiply(factor);
        }
        return accumulated.subtract(BigDecimal.ONE)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }

    @Cacheable(value = "inflation", key = "'current'", unless = "#result == null || #result.value == null || #result.value.signum() == 0")
    public InflationDTO getCurrentInflation() {
        log.info("Fetching current inflation (not from cache)");
        List<InflationDTO> inflations = argentinaDatosClient.getMonthlyInflation(13);
        
        if (inflations.isEmpty()) {
            log.warn("No inflation data available from API - returning empty result");
            return InflationDTO.builder()
                    .date(LocalDate.now().minusMonths(1))
                    .value(BigDecimal.ZERO)
                    .build();
        }
        
        InflationDTO latest = inflations.get(0);
        log.info("Got latest inflation: date={}, value={}", latest.getDate(), latest.getValue());
        
        if (inflations.size() >= 12) {
            BigDecimal yearOverYear = calculateYearOverYear(inflations);
            latest.setYearOverYear(yearOverYear);
            log.info("Calculated year-over-year inflation: {}%", yearOverYear);
        }
        
        BigDecimal ytd = calculateYearToDate(inflations);
        latest.setYearToDate(ytd);
        log.info("Calculated year-to-date inflation: {}%", ytd);
        
        return latest;
    }
    
    private BigDecimal calculateYearOverYear(List<InflationDTO> inflations) {
        BigDecimal accumulated = BigDecimal.ONE;
        int count = 0;
        for (InflationDTO inf : inflations) {
            if (count >= 12) {
                break;
            }
            BigDecimal factor = BigDecimal.ONE.add(
                    inf.getValue().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)
            );
            accumulated = accumulated.multiply(factor);
            count++;
        }
        return accumulated.subtract(BigDecimal.ONE)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }
    
    private BigDecimal calculateYearToDate(List<InflationDTO> inflations) {
        int currentYear = LocalDate.now().getYear();
        BigDecimal accumulated = BigDecimal.ONE;
        for (InflationDTO inf : inflations) {
            if (inf.getDate().getYear() != currentYear) {
                break;
            }
            BigDecimal factor = BigDecimal.ONE.add(
                    inf.getValue().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)
            );
            accumulated = accumulated.multiply(factor);
        }
        return accumulated.subtract(BigDecimal.ONE)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
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
