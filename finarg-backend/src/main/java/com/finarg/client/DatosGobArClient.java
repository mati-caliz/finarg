package com.finarg.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatosGobArClient {

    @Qualifier("datosGobArWebClient")
    private final WebClient webClient;

    private static final String RESERVAS_SERIES_ID = "92.2_RESERVAS_IRES_0_0_32_40";
    private static final String IPC_SERIES_ID = "148.3_INIVELam_2016_M_21";

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

    public List<SeriesDataPoint> getIPCHistorico(LocalDate desde, LocalDate hasta) {
        try {
            SeriesApiResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/series/")
                            .queryParam("ids", IPC_SERIES_ID)
                            .queryParam("start_date", desde.toString())
                            .queryParam("end_date", hasta.toString())
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
            log.error("Error fetching IPC from datos.gob.ar: {}", e.getMessage());
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
