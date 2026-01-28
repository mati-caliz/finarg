package com.finarg.client;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
public class DatosGobArClient {

    private final WebClient webClient;

    public DatosGobArClient(@Qualifier("datosGobArWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    private static final String RESERVAS_SERIES_ID = "92.2_RESERVAS_IRES_0_0_32_40";

    public List<SeriesDataPoint> getReservasBCRA(int limit) {
        try {
            SeriesApiResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/series/")
                            .queryParam("ids", RESERVAS_SERIES_ID)
                            .queryParam("limit", limit)
                            .queryParam("sort", "desc")
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(SeriesApiResponse.class)
                    .block();

            if (response == null || response.getData() == null) {
                return List.of();
            }

            return response.getData().stream()
                    .map(arr -> new SeriesDataPoint(
                            LocalDate.parse(arr.get(0).toString()),
                            arr.get(1) != null ? new BigDecimal(arr.get(1).toString()) : BigDecimal.ZERO
                    ))
                    .toList();
        } catch (Exception e) {
            log.error("Error fetching reservas from datos.gob.ar: {}", e.getMessage());
            return List.of();
        }
    }

    @Data
    public static class SeriesApiResponse {
        private List<List<Object>> data;
        private List<SeriesMeta> meta;

        @Data
        public static class SeriesMeta {
            private SeriesField field;

            @Data
            public static class SeriesField {
                private String description;
                private String units;
            }
        }
    }

    @Data
    public static class SeriesDataPoint {
        private LocalDate fecha;
        private BigDecimal valor;

        public SeriesDataPoint(LocalDate fecha, BigDecimal valor) {
            this.fecha = fecha;
            this.valor = valor;
        }
    }
}
