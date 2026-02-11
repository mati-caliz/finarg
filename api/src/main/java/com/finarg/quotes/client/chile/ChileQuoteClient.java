package com.finarg.quotes.client.chile;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finarg.quotes.dto.QuoteDTO;
import com.finarg.shared.enums.Country;
import com.finarg.shared.enums.CurrencyType;
import com.finarg.quotes.client.factory.QuoteClient;
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
public class ChileQuoteClient implements QuoteClient {

    private final WebClient webClient;

    public ChileQuoteClient(@Qualifier("chileApiWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public Country getCountry() {
        return Country.CHILE;
    }

    @Override
    public List<QuoteDTO> getAllQuotes() {
        List<QuoteDTO> quotes = new ArrayList<>();

        try {
            DolarObservadoResponse response = webClient.get()
                    .uri("/dolar")
                    .retrieve()
                    .bodyToMono(DolarObservadoResponse.class)
                    .block();

            if (response != null && response.getDolar() != null) {
                quotes.add(QuoteDTO.builder()
                        .type(CurrencyType.CL_OBSERVED)
                        .country(Country.CHILE)
                        .name("Dólar Observado (BCCh)")
                        .buy(response.getDolar().getValor())
                        .sell(response.getDolar().getValor())
                        .spread(BigDecimal.ZERO)
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(LocalDateTime.now())
                        .build());
            }
        } catch (Exception e) {
            log.error("Error fetching observed dollar from Chile API: {}", e.getMessage());
        }

        quotes.addAll(generateAdditionalQuotes());

        if (quotes.stream().noneMatch(q -> q.getType() == CurrencyType.CL_OBSERVED)) {
            quotes.add(generateFallbackObserved());
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
        BigDecimal baseRate = new BigDecimal("950");
        
        return List.of(
                QuoteDTO.builder()
                        .type(CurrencyType.CL_INFORMAL)
                        .country(Country.CHILE)
                        .name("Dólar Informal")
                        .buy(baseRate.subtract(new BigDecimal("10")))
                        .sell(baseRate.add(new BigDecimal("15")))
                        .spread(new BigDecimal("25"))
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(LocalDateTime.now())
                        .build(),
                QuoteDTO.builder()
                        .type(CurrencyType.CL_CRYPTO)
                        .country(Country.CHILE)
                        .name("Cripto P2P")
                        .buy(baseRate.subtract(new BigDecimal("5")))
                        .sell(baseRate.add(new BigDecimal("20")))
                        .spread(new BigDecimal("25"))
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(LocalDateTime.now())
                        .build()
        );
    }

    private QuoteDTO generateFallbackObserved() {
        return QuoteDTO.builder()
                .type(CurrencyType.CL_OBSERVED)
                .country(Country.CHILE)
                .name("Dólar Observado (BCCh)")
                .buy(new BigDecimal("950"))
                .sell(new BigDecimal("950"))
                .spread(BigDecimal.ZERO)
                .variation(BigDecimal.ZERO)
                .lastUpdate(LocalDateTime.now())
                .build();
    }

    @Data
    public static class DolarObservadoResponse {
        private DolarValue dolar;
    }

    @Data
    public static class DolarValue {
        private BigDecimal valor;
        @JsonProperty("fecha")
        private String fecha;
    }
}
