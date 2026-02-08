package com.finarg.client;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
        try {
            List<FciFundData> response = webClient.get()
                    .uri("/v1/finanzas/fci/mercadoDinero/ultimo/")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<FciFundData>>() { })
                    .block();

            if (response == null) {
                log.error("Empty response from FCI API (latest)");
                return List.of();
            }

            return response.stream()
                    .filter(fund -> fund.getVcp() != null && fund.getFecha() != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching latest FCI data: {}", e.getMessage());
            return List.of();
        }
    }

    public List<FciFundData> getPreviousFciData() {
        try {
            List<FciFundData> response = webClient.get()
                    .uri("/v1/finanzas/fci/mercadoDinero/penultimo/")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<FciFundData>>() { })
                    .block();

            if (response == null) {
                log.error("Empty response from FCI API (previous)");
                return List.of();
            }

            return response.stream()
                    .filter(fund -> fund.getVcp() != null && fund.getFecha() != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching previous FCI data: {}", e.getMessage());
            return List.of();
        }
    }

    public BigDecimal calculateTna(BigDecimal currentVcp, BigDecimal previousVcp) {
        if (currentVcp == null || previousVcp == null || previousVcp.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }

        BigDecimal dailyReturn = currentVcp.divide(previousVcp, 10, RoundingMode.HALF_UP)
                .subtract(BigDecimal.ONE);

        BigDecimal annualizedReturn = dailyReturn
                .multiply(new BigDecimal("365"))
                .multiply(new BigDecimal("100"));

        return annualizedReturn.setScale(2, RoundingMode.HALF_UP);
    }

    public List<FciFundData> getLatestRentaFijaData() {
        try {
            List<FciFundData> response = webClient.get()
                    .uri("/v1/finanzas/fci/rentaFija/ultimo/")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<FciFundData>>() { })
                    .block();

            if (response == null) {
                log.error("Empty response from FCI API (latest renta fija)");
                return List.of();
            }

            return response.stream()
                    .filter(fund -> fund.getVcp() != null && fund.getFecha() != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching latest renta fija FCI data: {}", e.getMessage());
            return List.of();
        }
    }

    public List<FciFundData> getPreviousRentaFijaData() {
        try {
            List<FciFundData> response = webClient.get()
                    .uri("/v1/finanzas/fci/rentaFija/penultimo/")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<FciFundData>>() { })
                    .block();

            if (response == null) {
                log.error("Empty response from FCI API (previous renta fija)");
                return List.of();
            }

            return response.stream()
                    .filter(fund -> fund.getVcp() != null && fund.getFecha() != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching previous renta fija FCI data: {}", e.getMessage());
            return List.of();
        }
    }

    public Map<String, BigDecimal> calculateAllTnas() {
        List<FciFundData> latestData = new java.util.ArrayList<>(getLatestFciData());
        latestData.addAll(getLatestRentaFijaData());

        List<FciFundData> previousData = new java.util.ArrayList<>(getPreviousFciData());
        previousData.addAll(getPreviousRentaFijaData());

        Map<String, FciFundData> previousMap = previousData.stream()
                .collect(Collectors.toMap(FciFundData::getFondo, fund -> fund, (a, b) -> a));

        return latestData.stream()
                .filter(latest -> previousMap.containsKey(latest.getFondo()))
                .collect(Collectors.toMap(
                        FciFundData::getFondo,
                        latest -> {
                            FciFundData previous = previousMap.get(latest.getFondo());
                            return calculateTna(latest.getVcp(), previous.getVcp());
                        },
                        (a, b) -> a
                ))
                .entrySet()
                .stream()
                .filter(entry -> entry.getValue() != null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    @Data
    public static class FciFundData {
        private String fondo;
        private String horizonte;
        private String fecha;
        private BigDecimal vcp;
        private BigDecimal ccp;
        private BigDecimal patrimonio;
    }
}
