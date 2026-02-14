package com.finarg.investments.stocks.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.List;

@Component
@Slf4j
public class YahooFinanceClient {
    private final WebClient webClient;

    public YahooFinanceClient(@Qualifier("yahooFinanceWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public List<StockQuoteResponse> getQuotes(List<String> symbols) {
        try {
            String symbolsParam = String.join(",", symbols);
            log.debug("Fetching stock quotes for: {}", symbolsParam);

            QuoteResponseWrapper response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/quote")
                            .queryParam("symbols", symbolsParam)
                            .build())
                    .retrieve()
                    .bodyToMono(QuoteResponseWrapper.class)
                    .block();

            if (response == null || response.getQuoteResponse() == null) {
                log.warn("No stock data received from Yahoo Finance");
                return List.of();
            }

            List<StockQuoteResponse> quotes = response.getQuoteResponse().getResult();
            log.debug("Received {} stock quotes", quotes != null ? quotes.size() : 0);

            return quotes != null ? quotes : List.of();
        } catch (Exception e) {
            log.error("Error fetching stock quotes: {}", e.getMessage(), e);
            return List.of();
        }
    }

    @Data
    public static class QuoteResponseWrapper {
        @JsonProperty("quoteResponse")
        private QuoteResponseData quoteResponse;
    }

    @Data
    public static class QuoteResponseData {
        @JsonProperty("result")
        private List<StockQuoteResponse> result;

        @JsonProperty("error")
        private Object error;
    }

    @Data
    public static class StockQuoteResponse {
        @JsonProperty("symbol")
        private String symbol;

        @JsonProperty("shortName")
        private String shortName;

        @JsonProperty("longName")
        private String longName;

        @JsonProperty("regularMarketPrice")
        private BigDecimal regularMarketPrice;

        @JsonProperty("regularMarketChange")
        private BigDecimal regularMarketChange;

        @JsonProperty("regularMarketChangePercent")
        private BigDecimal regularMarketChangePercent;

        @JsonProperty("regularMarketVolume")
        private Long regularMarketVolume;

        @JsonProperty("marketCap")
        private Long marketCap;

        @JsonProperty("currency")
        private String currency;

        @JsonProperty("regularMarketTime")
        private Long regularMarketTime;
    }
}
