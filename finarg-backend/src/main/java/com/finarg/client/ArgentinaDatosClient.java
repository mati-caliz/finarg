package com.finarg.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finarg.model.dto.InflationDTO;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class ArgentinaDatosClient {

    private final WebClient webClient;

    public ArgentinaDatosClient(@Qualifier("argentinaDatosWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public List<InflationDTO> getMonthlyInflation(int limit) {
        try {
            List<InflationResponse> responses = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/finanzas/indices/inflacion")
                            .build())
                    .retrieve()
                    .bodyToFlux(InflationResponse.class)
                    .collectList()
                    .block();

            if (responses == null) {
                return List.of();
            }

            return responses.stream()
                    .limit(limit)
                    .map(this::mapToInflationDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching inflation from ArgentinaDatos: {}", e.getMessage());
            return List.of();
        }
    }

    public List<InflationDTO> getYearOverYearInflation() {
        try {
            List<InflationResponse> responses = webClient.get()
                    .uri("/finanzas/indices/inflacionInteranual")
                    .retrieve()
                    .bodyToFlux(InflationResponse.class)
                    .collectList()
                    .block();

            if (responses == null) {
                return List.of();
            }

            return responses.stream()
                    .map(r -> InflationDTO.builder()
                            .date(LocalDate.parse(r.getFecha()))
                            .yearOverYear(r.getValor())
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching year over year inflation: {}", e.getMessage());
            return List.of();
        }
    }

    public List<TasaPlazoFijoResponse> getFixedTermRates() {
        try {
            List<TasaPlazoFijoResponse> responses = webClient.get()
                    .uri("/finanzas/tasas/plazoFijo")
                    .retrieve()
                    .bodyToFlux(TasaPlazoFijoResponse.class)
                    .collectList()
                    .block();

            return responses != null ? responses : List.of();
        } catch (Exception e) {
            log.error("Error fetching fixed term rates: {}", e.getMessage());
            return List.of();
        }
    }

    private InflationDTO mapToInflationDTO(InflationResponse response) {
        return InflationDTO.builder()
                .date(LocalDate.parse(response.getFecha()))
                .value(response.getValor())
                .build();
    }

    @Data
    public static class InflationResponse {
        private String fecha;
        private BigDecimal valor;
    }

    @Data
    public static class TasaPlazoFijoResponse {
        private String entidad;
        private String logo;
        @JsonProperty("tnaClientes")
        private BigDecimal tnaClientes;
        @JsonProperty("tnaNoClientes")
        private BigDecimal tnaNoClientes;
    }

}
