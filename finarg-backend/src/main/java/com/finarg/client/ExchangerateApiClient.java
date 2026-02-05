package com.finarg.client;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
public class ExchangerateApiClient {

    private final WebClient webClient;

    public ExchangerateApiClient(@Qualifier("exchangerateWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public Optional<Map<String, BigDecimal>> getUsdRates() {
        try {
            ExchangerateResponse response = webClient.get()
                    .uri("/latest/USD")
                    .retrieve()
                    .bodyToMono(ExchangerateResponse.class)
                    .block();
            if (response != null && response.getRates() != null && "success".equals(response.getResult())) {
                return Optional.of(response.getRates());
            }

            return Optional.empty();
        } catch (Exception e) {
            log.error("Error fetching rates from Exchangerate API: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Data
    public static class ExchangerateResponse {
        private String result;
        private Map<String, BigDecimal> rates = new HashMap<>();
    }
}
