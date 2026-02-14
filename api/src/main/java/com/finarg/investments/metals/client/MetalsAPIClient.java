package com.finarg.investments.metals.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.Map;

@Component
@Slf4j
public class MetalsAPIClient {
    private final WebClient webClient;

    public MetalsAPIClient(@Qualifier("metalsApiWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public Map getMetalsPrices() {
        try {
            log.debug("Fetching metals prices from Metals API");

            Map response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/latest")
                            .queryParam("base", "USD")
                            .queryParam("currencies", "XAU,XAG,XPT,XPD")
                            .build())
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .blockFirst();

            if (response == null || response.isEmpty()) {
                log.warn("No metals data received from Metals API");
                return Map.of();
            }

            log.debug("Received {} metals prices", response.size());
            return response;
        } catch (Exception e) {
            log.error("Error fetching metals prices: {}", e.getMessage(), e);
            return Map.of();
        }
    }

    @Data
    public static class MetalPriceResponse {
        @JsonProperty("code")
        private String code;

        @JsonProperty("price")
        private BigDecimal price;

        @JsonProperty("change")
        private BigDecimal change;

        @JsonProperty("changePercent")
        private BigDecimal changePercent;

        @JsonProperty("timestamp")
        private Long timestamp;
    }
}
