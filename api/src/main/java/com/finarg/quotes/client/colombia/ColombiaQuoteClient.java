package com.finarg.quotes.client.colombia;

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
public class ColombiaQuoteClient implements QuoteClient {

    private final WebClient webClient;

    public ColombiaQuoteClient(@Qualifier("colombiaApiWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public Country getCountry() {
        return Country.COLOMBIA;
    }

    @Override
    public List<QuoteDTO> getAllQuotes() {
        List<QuoteDTO> quotes = new ArrayList<>();
        
        try {
            TrmResponse trmResponse = webClient.get()
                    .uri("/trm")
                    .retrieve()
                    .bodyToMono(TrmResponse.class)
                    .block();

            if (trmResponse != null) {
                quotes.add(QuoteDTO.builder()
                        .type(CurrencyType.CO_TRM)
                        .country(Country.COLOMBIA)
                        .name("TRM (Tasa Representativa del Mercado)")
                        .buy(trmResponse.getValor())
                        .sell(trmResponse.getValor())
                        .spread(BigDecimal.ZERO)
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(LocalDateTime.now())
                        .build());
            }

            CasasCambioResponse casasResponse = webClient.get()
                    .uri("/casas-cambio")
                    .retrieve()
                    .bodyToMono(CasasCambioResponse.class)
                    .block();

            if (casasResponse != null) {
                quotes.add(QuoteDTO.builder()
                        .type(CurrencyType.CO_EXCHANGE_HOUSES)
                        .country(Country.COLOMBIA)
                        .name("Casas de Cambio")
                        .buy(casasResponse.getCompra())
                        .sell(casasResponse.getVenta())
                        .spread(casasResponse.getVenta().subtract(casasResponse.getCompra()))
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(LocalDateTime.now())
                        .build());
            }

            quotes.add(generateCryptoQuote());
            
        } catch (Exception e) {
            log.error("Error fetching quotes from Colombia API: {}", e.getMessage());
            quotes.addAll(generateFallbackQuotes());
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

    private QuoteDTO generateCryptoQuote() {
        return QuoteDTO.builder()
                .type(CurrencyType.CO_CRYPTO)
                .country(Country.COLOMBIA)
                .name("Cripto P2P")
                .buy(new BigDecimal("4150"))
                .sell(new BigDecimal("4250"))
                .spread(new BigDecimal("100"))
                .variation(BigDecimal.ZERO)
                .lastUpdate(LocalDateTime.now())
                .build();
    }

    private List<QuoteDTO> generateFallbackQuotes() {
        return List.of(
                QuoteDTO.builder()
                        .type(CurrencyType.CO_TRM)
                        .country(Country.COLOMBIA)
                        .name("TRM (Tasa Representativa del Mercado)")
                        .buy(new BigDecimal("4200"))
                        .sell(new BigDecimal("4200"))
                        .spread(BigDecimal.ZERO)
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(LocalDateTime.now())
                        .build(),
                QuoteDTO.builder()
                        .type(CurrencyType.CO_EXCHANGE_HOUSES)
                        .country(Country.COLOMBIA)
                        .name("Casas de Cambio")
                        .buy(new BigDecimal("4180"))
                        .sell(new BigDecimal("4220"))
                        .spread(new BigDecimal("40"))
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(LocalDateTime.now())
                        .build()
        );
    }

    @Data
    public static class TrmResponse {
        private BigDecimal valor;
        @JsonProperty("fecha")
        private String fecha;
    }

    @Data
    public static class CasasCambioResponse {
        private BigDecimal compra;
        private BigDecimal venta;
    }
}
