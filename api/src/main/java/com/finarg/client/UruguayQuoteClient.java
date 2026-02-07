package com.finarg.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finarg.model.dto.QuoteDTO;
import com.finarg.model.enums.Country;
import com.finarg.model.enums.CurrencyType;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class UruguayQuoteClient implements QuoteClient {

    private final WebClient webClient;

    public UruguayQuoteClient(@Qualifier("uruguayApiWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public Country getCountry() {
        return Country.URUGUAY;
    }

    @Override
    public List<QuoteDTO> getAllQuotes() {
        List<QuoteDTO> quotes = new ArrayList<>();

        try {
            DolarBcuResponse response = webClient.get()
                    .uri("/cotizaciones/monedas")
                    .retrieve()
                    .bodyToMono(DolarBcuResponse.class)
                    .block();

            if (response != null) {
                quotes.add(QuoteDTO.builder()
                        .type(CurrencyType.UY_INTERBANK)
                        .country(Country.URUGUAY)
                        .name("Interbancario (BCU)")
                        .buy(response.getCompra())
                        .sell(response.getVenta())
                        .spread(response.getVenta().subtract(response.getCompra()))
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(LocalDateTime.now())
                        .build());
            }
        } catch (Exception e) {
            log.error("Error fetching quotes from BCU API: {}", e.getMessage());
        }

        quotes.addAll(generateAdditionalQuotes());

        if (quotes.stream().noneMatch(q -> q.getType() == CurrencyType.UY_INTERBANK)) {
            quotes.add(generateFallbackInterbank());
        }

        return quotes;
    }

    @Override
    public QuoteDTO getQuote(CurrencyType type) {
        return getAllQuotes().stream()
                .filter(q -> q.getType() == type)
                .findFirst()
                .orElse(null);
    }

    private List<QuoteDTO> generateAdditionalQuotes() {
        BigDecimal baseRate = new BigDecimal("42");
        
        return List.of(
                QuoteDTO.builder()
                        .type(CurrencyType.UY_BILL)
                        .country(Country.URUGUAY)
                        .name("Dólar Billete")
                        .buy(baseRate.subtract(new BigDecimal("0.50")))
                        .sell(baseRate.add(new BigDecimal("0.80")))
                        .spread(new BigDecimal("1.30"))
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(LocalDateTime.now())
                        .build(),
                QuoteDTO.builder()
                        .type(CurrencyType.UY_EBROU)
                        .country(Country.URUGUAY)
                        .name("eBROU")
                        .buy(baseRate.subtract(new BigDecimal("0.20")))
                        .sell(baseRate.add(new BigDecimal("0.40")))
                        .spread(new BigDecimal("0.60"))
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(LocalDateTime.now())
                        .build()
        );
    }

    private QuoteDTO generateFallbackInterbank() {
        BigDecimal baseRate = new BigDecimal("42");
        
        return QuoteDTO.builder()
                .type(CurrencyType.UY_INTERBANK)
                .country(Country.URUGUAY)
                .name("Interbancario (BCU)")
                .buy(baseRate.subtract(new BigDecimal("0.10")))
                .sell(baseRate.add(new BigDecimal("0.10")))
                .spread(new BigDecimal("0.20"))
                .variation(BigDecimal.ZERO)
                .lastUpdate(LocalDateTime.now())
                .build();
    }

    @Data
    public static class DolarBcuResponse {
        private BigDecimal compra;
        private BigDecimal venta;
        @JsonProperty("fecha")
        private String fecha;
    }
}
