package com.finarg.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finarg.model.dto.CotizacionDTO;
import com.finarg.model.enums.TipoDolar;
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
public class DolarApiClient {

    private final WebClient webClient;

    public DolarApiClient(@Qualifier("dolarApiWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public List<CotizacionDTO> getAllCotizaciones() {
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
                    .map(this::mapToCotizacionDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching cotizaciones from DolarAPI: {}", e.getMessage());
            return List.of();
        }
    }

    public CotizacionDTO getCotizacionBlocking(TipoDolar tipo) {
        try {
            DolarApiResponse response = webClient.get()
                    .uri("/dolares/{tipo}", tipo.getCodigo())
                    .retrieve()
                    .bodyToMono(DolarApiResponse.class)
                    .block();

            return response != null ? mapToCotizacionDTO(response) : null;
        } catch (Exception e) {
            log.error("Error fetching cotizacion {}: {}", tipo, e.getMessage());
            return null;
        }
    }

    private CotizacionDTO mapToCotizacionDTO(DolarApiResponse response) {
        BigDecimal compra = response.getCompra() != null ? response.getCompra() : BigDecimal.ZERO;
        BigDecimal venta = response.getVenta() != null ? response.getVenta() : BigDecimal.ZERO;
        BigDecimal spread = venta.subtract(compra);

        TipoDolar tipo;
        try {
            tipo = TipoDolar.fromCodigo(response.getCasa());
        } catch (IllegalArgumentException e) {
            tipo = TipoDolar.OFICIAL;
        }

        LocalDateTime fechaActualizacion = LocalDateTime.now();
        if (response.getFechaActualizacion() != null) {
            try {
                fechaActualizacion = ZonedDateTime.parse(response.getFechaActualizacion()).toLocalDateTime();
            } catch (Exception ignored) {
            }
        }

        return CotizacionDTO.builder()
                .tipo(tipo)
                .nombre(response.getNombre())
                .compra(compra)
                .venta(venta)
                .spread(spread)
                .variacion(BigDecimal.ZERO)
                .fechaActualizacion(fechaActualizacion)
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
