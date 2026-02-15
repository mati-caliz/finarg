package com.finarg.indicators.countryrisk.service;

import com.finarg.quotes.client.argentina.ArgentinaDatosClient;
import com.finarg.indicators.countryrisk.dto.CountryRiskDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CountryRiskService {

    private final ArgentinaDatosClient argentinaDatosClient;

    @Cacheable(value = "countryRisk", key = "'current'")
    public CountryRiskDTO getCurrentCountryRisk() {
        log.info("Fetching current country risk");
        ArgentinaDatosClient.CountryRiskResponse response = argentinaDatosClient.getLatestCountryRisk();

        if (response == null) {
            log.warn("No country risk data available from API");
            return null;
        }

        return CountryRiskDTO.builder()
                .value(response.getValue())
                .date(LocalDate.parse(response.getDate()))
                .displayPercentage(calculateDisplayPercentage(response.getValue().doubleValue()))
                .build();
    }

    @Cacheable(value = "countryRisk", key = "'history'")
    public List<CountryRiskDTO> getCountryRiskHistory() {
        log.info("Fetching country risk history");
        List<ArgentinaDatosClient.CountryRiskResponse> responses = argentinaDatosClient.getCountryRiskHistory();

        if (responses == null || responses.isEmpty()) {
            log.warn("No country risk history available from API");
            return List.of();
        }

        return responses.stream()
                .map(response -> CountryRiskDTO.builder()
                        .value(response.getValue())
                        .date(LocalDate.parse(response.getDate()))
                        .displayPercentage(calculateDisplayPercentage(response.getValue().doubleValue()))
                        .build())
                .toList();
    }

    private static final double MAX_COUNTRY_RISK_DISPLAY = 2000.0;

    private static double calculateDisplayPercentage(double value) {
        return Math.min((value / MAX_COUNTRY_RISK_DISPLAY) * 100, 100);
    }
}
