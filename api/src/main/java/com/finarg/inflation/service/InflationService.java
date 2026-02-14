package com.finarg.inflation.service;

import com.finarg.quotes.client.argentina.ArgentinaDatosClient;
import com.finarg.inflation.dto.InflationAdjustmentDTO;
import com.finarg.inflation.dto.InflationDTO;
import com.finarg.shared.util.BigDecimalUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.function.Predicate;

@Slf4j
@Service
@RequiredArgsConstructor
public class InflationService {

    private final ArgentinaDatosClient argentinaDatosClient;

    @Cacheable(value = "inflation", key = "'monthly_' + #limit")
    public List<InflationDTO> getMonthlyInflation(int limit) {
        log.info("Fetching monthly inflation, limit: {}", limit);
        int fetchLimit = limit + BigDecimalUtils.MONTHS_PER_YEAR;
        List<InflationDTO> list = argentinaDatosClient.getMonthlyInflation(fetchLimit);
        if (list == null || list.isEmpty()) {
            return list;
        }
        for (int i = 0; i < list.size(); i++) {
            if (i + BigDecimalUtils.MONTHS_PER_YEAR <= list.size()) {
                BigDecimal yoy = accumulateInflation(
                        list.subList(i, i + BigDecimalUtils.MONTHS_PER_YEAR),
                        inf -> inf.getValue() != null,
                        BigDecimalUtils.MONTHS_PER_YEAR
                );
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
        return accumulateInflation(list,
                inf -> inf.getDate() != null
                        && inf.getDate().getYear() == year
                        && !inf.getDate().isAfter(targetDate)
                        && inf.getValue() != null,
                -1);
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

        if (inflations.size() >= BigDecimalUtils.MONTHS_PER_YEAR) {
            BigDecimal yearOverYear = accumulateInflation(
                    inflations,
                    inf -> inf.getValue() != null,
                    BigDecimalUtils.MONTHS_PER_YEAR
            );
            latest.setYearOverYear(yearOverYear);
            log.info("Calculated year-over-year inflation: {}%", yearOverYear);
        }

        int currentYear = LocalDate.now().getYear();
        BigDecimal ytd = accumulateInflation(inflations,
                inf -> inf.getDate() != null
                        && inf.getDate().getYear() == currentYear
                        && inf.getValue() != null,
                -1);
        latest.setYearToDate(ytd);
        log.info("Calculated year-to-date inflation: {}%", ytd);

        return latest;
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
                    && !inf.getDate().isAfter(toDate)
                    && inf.getValue() != null) {
                accumulatedFactor = accumulatedFactor.multiply(
                        BigDecimalUtils.inflationFactor(inf.getValue())
                );
            }
        }

        BigDecimal adjustedAmount = originalAmount.multiply(accumulatedFactor)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal cumulativeInflation = accumulatedFactor.subtract(BigDecimal.ONE)
                .multiply(BigDecimalUtils.ONE_HUNDRED)
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

    private BigDecimal accumulateInflation(List<InflationDTO> inflations,
                                           Predicate<InflationDTO> filter,
                                           int maxCount) {
        BigDecimal accumulated = BigDecimal.ONE;
        int count = 0;
        for (InflationDTO inf : inflations) {
            if (maxCount > 0 && count >= maxCount) {
                break;
            }
            if (!filter.test(inf)) {
                continue;
            }
            accumulated = accumulated.multiply(BigDecimalUtils.inflationFactor(inf.getValue()));
            count++;
        }
        return accumulated.subtract(BigDecimal.ONE)
                .multiply(BigDecimalUtils.ONE_HUNDRED)
                .setScale(1, RoundingMode.HALF_UP);
    }
}
