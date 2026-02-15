package com.finarg.crypto.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import org.springframework.web.reactive.function.client.WebClientException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class CoinGeckoClient {

    private final WebClient webClient;

    public CoinGeckoClient(@Qualifier("coinGeckoWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public Map<String, CryptoPriceData> getCryptoPrices() {
        try {
            Map<String, CryptoPriceData> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/simple/price")
                            .queryParam("ids", "bitcoin,ethereum,binancecoin,ripple,cardano,solana")
                            .queryParam("vs_currencies", "usd")
                            .queryParam("include_24hr_change", "true")
                            .build())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, CryptoPriceData>>() { })
                    .block();

            if (response == null) {
                log.warn("No crypto data received from CoinGecko");
                return new HashMap<>();
            }

            return response;
        } catch (WebClientException e) {
            log.error("Error fetching crypto prices from CoinGecko: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    @Data
    public static class CryptoPriceData {
        @JsonProperty("usd")
        private BigDecimal usd;

        @JsonProperty("usd_24h_change")
        private BigDecimal usd24hChange;
    }
}
