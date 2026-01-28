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
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class ArgentinaQuoteClient implements QuoteClient {

    private final WebClient webClient;

    public ArgentinaQuoteClient(@Qualifier("dolarApiWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public Country getCountry() {
        return Country.ARGENTINA;
    }

    @Override
    public List<QuoteDTO> getAllQuotes() {
        try {
            List<DolarApiResponse> responses = webClient.get()
                    .uri("/dolares")
                    .retrieve()
                    .bodyToFlux(DolarApiResponse.class)
                    .collectList()
                    .block();

            if (responses == null) {
                return List.of();
            }

            return responses.stream()
                    .map(this::mapToQuoteDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching quotes from DolarAPI: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public QuoteDTO getQuote(CurrencyType type) {
        try {
            DolarApiResponse response = webClient.get()
                    .uri("/dolares/{tipo}", type.getCode())
                    .retrieve()
                    .bodyToMono(DolarApiResponse.class)
                    .block();

            return response != null ? mapToQuoteDTO(response) : null;
        } catch (Exception e) {
            log.error("Error fetching quote {}: {}", type, e.getMessage());
            return null;
        }
    }

    private QuoteDTO mapToQuoteDTO(DolarApiResponse response) {
        BigDecimal buy = response.getCompra() != null ? response.getCompra() : BigDecimal.ZERO;
        BigDecimal sell = response.getVenta() != null ? response.getVenta() : BigDecimal.ZERO;
        BigDecimal spread = sell.subtract(buy);

        CurrencyType type;
        try {
            type = CurrencyType.fromCode(response.getCasa(), Country.ARGENTINA);
        } catch (IllegalArgumentException e) {
            type = CurrencyType.AR_OFFICIAL;
        }

        LocalDateTime lastUpdate = LocalDateTime.now();
        if (response.getFechaActualizacion() != null) {
            try {
                lastUpdate = ZonedDateTime.parse(response.getFechaActualizacion()).toLocalDateTime();
            } catch (Exception ignored) {
            }
        }

        return QuoteDTO.builder()
                .type(type)
                .country(Country.ARGENTINA)
                .name(response.getNombre())
                .buy(buy)
                .sell(sell)
                .spread(spread)
                .variation(BigDecimal.ZERO)
                .lastUpdate(lastUpdate)
                .build();
    }

    @Data
    public static class DolarApiResponse {
        private String moneda;
        private String casa;
        private String nombre;
        private BigDecimal compra;
        private BigDecimal venta;
        @JsonProperty("fechaActualizacion")
        private String fechaActualizacion;
    }
}
