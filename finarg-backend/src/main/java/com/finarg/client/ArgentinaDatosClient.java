package com.finarg.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finarg.model.dto.InflacionDTO;
import lombok.Data;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class ArgentinaDatosClient {

    @Qualifier("argentinaDatosWebClient")
    private final WebClient webClient;

    public List<InflacionDTO> getInflacionMensual(int limit) {
        try {
            List<InflacionResponse> responses = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/finanzas/indices/inflacion")
                            .build())
                    .retrieve()
                    .bodyToFlux(InflacionResponse.class)
                    .collectList()
                    .block();

            if (responses == null) {
                return List.of();
            }

            return responses.stream()
                    .limit(limit)
                    .map(this::mapToInflacionDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching inflacion from ArgentinaDatos: {}", e.getMessage());
            return List.of();
        }
    }

    public List<InflacionDTO> getInflacionInteranual() {
        try {
            List<InflacionResponse> responses = webClient.get()
                    .uri("/finanzas/indices/inflacionInteranual")
                    .retrieve()
                    .bodyToFlux(InflacionResponse.class)
                    .collectList()
                    .block();

            if (responses == null) {
                return List.of();
            }

            return responses.stream()
                    .map(r -> InflacionDTO.builder()
                            .fecha(LocalDate.parse(r.getFecha()))
                            .interanual(r.getValor())
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching inflacion interanual: {}", e.getMessage());
            return List.of();
        }
    }

    public BigDecimal getRiesgoPais() {
        try {
            RiesgoPaisResponse response = webClient.get()
                    .uri("/finanzas/indices/riesgo-pais/ultimo")
                    .retrieve()
                    .bodyToMono(RiesgoPaisResponse.class)
                    .block();

            return response != null ? BigDecimal.valueOf(response.getValor()) : BigDecimal.ZERO;
        } catch (Exception e) {
            log.error("Error fetching riesgo pais: {}", e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    public List<TasaPlazoFijoResponse> getTasasPlazoFijo() {
        try {
            List<TasaPlazoFijoResponse> responses = webClient.get()
                    .uri("/finanzas/tasas/plazoFijo")
                    .retrieve()
                    .bodyToFlux(TasaPlazoFijoResponse.class)
                    .collectList()
                    .block();

            return responses != null ? responses : List.of();
        } catch (Exception e) {
            log.error("Error fetching tasas plazo fijo: {}", e.getMessage());
            return List.of();
        }
    }

    public List<UvaResponse> getUva(int limit) {
        try {
            List<UvaResponse> responses = webClient.get()
                    .uri("/finanzas/indices/uva")
                    .retrieve()
                    .bodyToFlux(UvaResponse.class)
                    .collectList()
                    .block();

            if (responses == null) {
                return List.of();
            }

            return responses.stream().limit(limit).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching UVA: {}", e.getMessage());
            return List.of();
        }
    }

    private InflacionDTO mapToInflacionDTO(InflacionResponse response) {
        return InflacionDTO.builder()
                .fecha(LocalDate.parse(response.getFecha()))
                .valor(response.getValor())
                .build();
    }

    @Data
    public static class InflacionResponse {
        private String fecha;
        private BigDecimal valor;
    }

    @Data
    public static class RiesgoPaisResponse {
        private int valor;
        private String fecha;
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

    @Data
    public static class UvaResponse {
        private String fecha;
        private BigDecimal valor;
    }
}
