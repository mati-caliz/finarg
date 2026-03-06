package com.finarg.rates.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finarg.shared.util.BigDecimalUtils;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class FciClient {

    private final WebClient webClient;

    public FciClient(@Qualifier("fciWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public List<FciFundData> getLatestFciData() {
        return fetchFundData("/v1/finanzas/fci/mercadoDinero/ultimo/");
    }

    public List<FciFundData> getPreviousFciData() {
        return fetchFundData("/v1/finanzas/fci/mercadoDinero/penultimo/");
    }

    public List<FciFundData> getLatestRentaFijaData() {
        return fetchFundData("/v1/finanzas/fci/rentaFija/ultimo/");
    }

    public List<FciFundData> getPreviousRentaFijaData() {
        return fetchFundData("/v1/finanzas/fci/rentaFija/penultimo/");
    }

    private List<FciFundData> fetchFundData(String uriPath) {
        try {
            List<FciFundData> response = webClient.get()
                    .uri(uriPath)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<FciFundData>>() { })
                    .block();

            if (response == null) {
                log.error("Empty response from FCI API: {}", uriPath);
                return List.of();
            }

            return response.stream()
                    .filter(fund -> fund.getShareValue() != null && fund.getDate() != null)
                    .toList();
        } catch (WebClientException e) {
            log.error("Error fetching FCI data from {}: {}", uriPath, e.getMessage());
            return List.of();
        }
    }

    public BigDecimal calculateTna(BigDecimal currentVcp, BigDecimal previousVcp, String currentDate, String previousDate) {
        if (currentVcp == null || previousVcp == null || previousVcp.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }

        long daysBetween = resolveDaysBetween(previousDate, currentDate);
        if (daysBetween <= 0) {
            return null;
        }

        double ratio = currentVcp.divide(previousVcp, 10, RoundingMode.HALF_UP).doubleValue();
        double dailyRate = Math.pow(ratio, 1.0 / daysBetween) - 1.0;

        BigDecimal annualizedReturn = BigDecimal.valueOf(dailyRate)
                .multiply(BigDecimal.valueOf(BigDecimalUtils.DAYS_PER_YEAR))
                .multiply(BigDecimalUtils.ONE_HUNDRED);

        return annualizedReturn.setScale(2, RoundingMode.HALF_UP);
    }

    public Map<String, BigDecimal> calculateAllTnas() {
        List<FciFundData> latestData = new ArrayList<>(getLatestFciData());
        latestData.addAll(getLatestRentaFijaData());

        List<FciFundData> previousData = new ArrayList<>(getPreviousFciData());
        previousData.addAll(getPreviousRentaFijaData());

        Map<String, FciFundData> previousMap = previousData.stream()
                .collect(Collectors.toMap(FciFundData::getFundName, fund -> fund, (a, b) -> a));

        Map<String, BigDecimal> result = new HashMap<>();
        latestData.stream()
                .filter(latest -> previousMap.containsKey(latest.getFundName()))
                .forEach(latest -> {
                    FciFundData previous = previousMap.get(latest.getFundName());
                    BigDecimal tna = calculateTna(latest.getShareValue(), previous.getShareValue(), latest.getDate(), previous.getDate());
                    if (tna != null) {
                        result.putIfAbsent(latest.getFundName(), tna);
                    }
                });
        return result;
    }

    private static long resolveDaysBetween(String previousDate, String currentDate) {
        if (previousDate == null || currentDate == null) {
            return 0;
        }
        try {
            LocalDate prev = LocalDate.parse(previousDate);
            LocalDate current = LocalDate.parse(currentDate);
            return ChronoUnit.DAYS.between(prev, current);
        } catch (Exception e) {
            return 0;
        }
    }

    @Data
    public static class FciFundData {
        @JsonProperty("fondo")
        private String fundName;
        @JsonProperty("horizonte")
        private String horizon;
        @JsonProperty("fecha")
        private String date;
        @JsonProperty("vcp")
        private BigDecimal shareValue;
        @JsonProperty("ccp")
        private BigDecimal sharePrice;
        @JsonProperty("patrimonio")
        private BigDecimal equity;
    }
}
