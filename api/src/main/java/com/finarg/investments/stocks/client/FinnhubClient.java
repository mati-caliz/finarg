package com.finarg.investments.stocks.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;

@Component
@Slf4j
public class FinnhubClient {
    private final WebClient webClient;

    public FinnhubClient(@Qualifier("finnhubWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public List<StockQuoteResponse> getQuotes(List<String> symbols) {
        try {
            log.debug("Fetching stock quotes for: {}", symbols);

            List<StockQuoteResponse> quotes = Flux.fromIterable(symbols)
                    .flatMap(symbol -> getQuote(symbol)
                            .map(quote -> {
                                StockQuoteResponse response = new StockQuoteResponse();
                                response.setSymbol(symbol);
                                response.setRegularMarketPrice(quote.getCurrentPrice());
                                response.setRegularMarketChange(quote.getChange());
                                response.setRegularMarketChangePercent(quote.getPercentChange());
                                response.setRegularMarketTime(quote.getTimestamp());
                                response.setCurrency("USD");
                                return response;
                            })
                            .onErrorResume(e -> Mono.empty())
                    )
                    .collectList()
                    .block();

            if (quotes == null || quotes.isEmpty()) {
                log.warn("No stock data received from Finnhub");
                return List.of();
            }

            Flux.fromIterable(symbols)
                    .flatMap(this::getProfile)
                    .doOnNext(profile -> quotes.stream()
                            .filter(q -> q.getSymbol().equals(profile.getTicker()))
                            .findFirst()
                            .ifPresent(q -> {
                                q.setShortName(profile.getName());
                                q.setLongName(profile.getName());
                                q.setMarketCap(profile.getMarketCapitalization() != null
                                    ? profile.getMarketCapitalization().multiply(new BigDecimal("1000000")).longValue()
                                    : null);
                            }))
                    .collectList()
                    .block();

            log.debug("Received {} stock quotes", quotes.size());
            return quotes;
        } catch (Exception e) {
            log.error("Error fetching stock quotes: {}", e.getMessage(), e);
            return List.of();
        }
    }

    private Mono<FinnhubQuoteResponse> getQuote(String symbol) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/quote")
                        .queryParam("symbol", symbol)
                        .build())
                .retrieve()
                .bodyToMono(FinnhubQuoteResponse.class);
    }

    private Mono<FinnhubProfileResponse> getProfile(String symbol) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/stock/profile2")
                        .queryParam("symbol", symbol)
                        .build())
                .retrieve()
                .bodyToMono(FinnhubProfileResponse.class)
                .onErrorResume(e -> {
                    log.debug("Profile not found for {}", symbol);
                    return Mono.empty();
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

        @JsonProperty("h")
        private BigDecimal highPrice;

        @JsonProperty("l")
        private BigDecimal lowPrice;

        @JsonProperty("o")
        private BigDecimal openPrice;

        @JsonProperty("pc")
        private BigDecimal previousClose;

        @JsonProperty("t")
        private Long timestamp;
    }

    @Data
    public static class FinnhubProfileResponse {
        @JsonProperty("ticker")
        private String ticker;

        @JsonProperty("name")
        private String name;

        @JsonProperty("marketCapitalization")
        private BigDecimal marketCapitalization;

        @JsonProperty("country")
        private String country;

        @JsonProperty("currency")
        private String currency;

        @JsonProperty("exchange")
        private String exchange;
    }

    @Data
    public static class StockQuoteResponse {
        private String symbol;
        private String shortName;
        private String longName;
        private BigDecimal regularMarketPrice;
        private BigDecimal regularMarketChange;
        private BigDecimal regularMarketChangePercent;
        private Long regularMarketVolume;
        private Long marketCap;
        private String currency;
        private Long regularMarketTime;
    }
}
