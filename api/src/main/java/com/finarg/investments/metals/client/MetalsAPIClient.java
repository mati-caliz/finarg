package com.finarg.investments.metals.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class MetalsAPIClient {
    private final WebClient webClient;

    private static final Map<String, String> METAL_SYMBOLS = Map.of(
            "XAU", "OANDA:XAU_USD",
            "XAG", "OANDA:XAG_USD",
            "XPT", "OANDA:XPT_USD",
            "XPD", "OANDA:XPD_USD"
    );

    public MetalsAPIClient(@Qualifier("finnhubWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public Map<String, MetalQuote> getMetalsPrices() {
        try {
            log.debug("Fetching metals prices from Finnhub");

            Map<String, MetalQuote> results = new LinkedHashMap<>();

            List<Map.Entry<String, String>> metalsList = List.copyOf(METAL_SYMBOLS.entrySet());

            Flux.fromIterable(metalsList)
                    .flatMap(entry -> {
                        String code = entry.getKey();
                        String symbol = entry.getValue();
                        return getMetalQuote(symbol)
                                .map(quote -> Map.entry(code, quote))
                                .onErrorResume(e -> {
                                    log.warn("Failed to fetch quote for metal {}: {}", code, e.getMessage());
                                    return Flux.empty();
                                });
                    })
                    .doOnNext(entry -> results.put(entry.getKey(), entry.getValue()))
                    .collectList()
                    .block();

            log.debug("Received {} metals prices", results.size());
            return results;
        } catch (Exception e) {
            log.error("Error fetching metals prices: {}", e.getMessage(), e);
            return Map.of();
        }
    }

    private Flux<MetalQuote> getMetalQuote(String symbol) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/quote")
                        .queryParam("symbol", symbol)
                        .build())
                .retrieve()
                .bodyToFlux(FinnhubQuoteResponse.class)
                .map(response -> {
                    MetalQuote quote = new MetalQuote();
                    quote.setPrice(response.getCurrentPrice());
                    quote.setChange(response.getChange());
                    quote.setPercentChange(response.getPercentChange());
                    quote.setTimestamp(response.getTimestamp());
                    return quote;
                });
    }

    @Data
    public static class FinnhubQuoteResponse {
        @JsonProperty("c")
        private BigDecimal currentPrice;

        @JsonProperty("d")
        private BigDecimal change;

        @JsonProperty("dp")
        private BigDecimal percentChange;

        @JsonProperty("t")
        private Long timestamp;
    }

    @Data
    public static class MetalQuote {
        private BigDecimal price;
        private BigDecimal change;
        private BigDecimal percentChange;
        private Long timestamp;
    }
}
