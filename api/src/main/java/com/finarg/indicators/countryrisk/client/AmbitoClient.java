package com.finarg.indicators.countryrisk.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finarg.quotes.dto.QuoteDTO;
import com.finarg.shared.enums.Country;
import com.finarg.shared.enums.CurrencyType;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Slf4j
@Component
public class AmbitoClient {

    private final WebClient webClient;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public AmbitoClient(@Qualifier("ambitoWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public Optional<QuoteDTO> getEuroOficialQuote() {
        return fetchEuroQuote("/euro/oficial/variacion", CurrencyType.AR_EUR_OFICIAL, "Euro Oficial");
    }

    public Optional<QuoteDTO> getEuroBlueQuote() {
        return fetchEuroQuote("/euro/informal/variacion", CurrencyType.AR_EUR_BLUE, "Euro Blue");
    }

    private Optional<QuoteDTO> fetchEuroQuote(String endpoint, CurrencyType type, String name) {
        try {
            AmbitoResponse response = webClient.get()
                    .uri(endpoint)
                    .retrieve()
                    .bodyToMono(AmbitoResponse.class)
                    .block();

            if (response == null) {
                return Optional.empty();
            }

            BigDecimal buy = parseAmount(response.getCompra());
            BigDecimal sell = parseAmount(response.getVenta());

            LocalDateTime lastUpdate = LocalDateTime.now();
            if (response.getFecha() != null && !response.getFecha().isEmpty()) {
                try {
                    lastUpdate = LocalDateTime.parse(response.getFecha(), DATE_FORMATTER);
                } catch (Exception ignored) {
                }
            }

            return Optional.of(QuoteDTO.builder()
                    .type(type)
                    .country(Country.ARGENTINA)
                    .name(name)
                    .buy(buy)
                    .sell(sell)
                    .spread(sell.subtract(buy))
                    .variation(BigDecimal.ZERO)
                    .lastUpdate(lastUpdate)
                    .build());
        } catch (Exception e) {
            log.error("Error fetching {} from Ambito: {}", name, e.getMessage());
            return Optional.empty();
        }
    }

    private BigDecimal parseAmount(String amount) {
        if (amount == null || amount.isEmpty()) {
            return BigDecimal.ZERO;
        }
        String cleaned = amount.replace(".", "").replace(",", ".");
        try {
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    @Data
    public static class AmbitoResponse {
        private String compra;
        private String venta;
        private String fecha;
        private String variacion;
        @JsonProperty("class-variacion")
        private String classVariacion;
        @JsonProperty("variacion-nombre")
        private String variacionNombre;
    }
}
