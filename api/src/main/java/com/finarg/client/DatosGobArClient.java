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

    private static final String RESERVES_SERIES_ID = "92.2_RESERVAS_IRES_0_0_32_40";
    private static final String MINIMUM_SALARY_SERIES_ID = "57.1_SMVMM_0_M_34";
    private static final String MINIMUM_PENSION_SERIES_ID = "58.1_MP_0_M_24";
    private static final String CANASTA_BASICA_TOTAL_SERIES_ID = "444.1_CANASTA_batotGBA_0_0_26_47";
    private static final String CANASTA_BASICA_ALIMENTARIA_SERIES_ID = "444.1_CANASTA_baalimGBA_0_0_26_47";
    private static final String SALARIO_RIPTE_SERIES_ID = "353.2_RIPTE_0_M_29";
    private static final String PASIVOS_LETRAS_USD_ID = "92.2_PASIVOS_MORES_0_0_33_100";
    private static final String DEPOSITOS_GOBIERNO_ID = "92.2_OTROS_DEPORNO_0_0_24_42";
    private static final String POSICION_NETA_PASES_ID = "92.2_POSICION_NSES_0_0_19_25";
    private static final String TIPO_CAMBIO_VAL_ID = "92.2_TIPO_CAMBIION_0_0_21_24";

    public List<SeriesDataPoint> getBCRAReserves(int limit) {
        return fetchSeries(limit);
    }

    public BigDecimal getLatestMinimumSalary() {
        return fetchLatestValue(MINIMUM_SALARY_SERIES_ID);
    }

    public BigDecimal getLatestMinimumPension() {
        return fetchLatestValue(MINIMUM_PENSION_SERIES_ID);
    }

    public BigDecimal getLatestCanastaBasicaTotal() {
        return fetchLatestValue(CANASTA_BASICA_TOTAL_SERIES_ID);
    }

    public BigDecimal getLatestCanastaBasicaAlimentaria() {
        return fetchLatestValue(CANASTA_BASICA_ALIMENTARIA_SERIES_ID);
    }

    public BigDecimal getLatestSalarioRipte() {
        return fetchLatestValue(SALARIO_RIPTE_SERIES_ID);
    }

    private BigDecimal fetchLatestValue(String seriesId) {
        try {
            SeriesApiResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/series/")
                            .queryParam("ids", seriesId)
                            .queryParam("limit", 1)
                            .queryParam("sort", "desc")
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(SeriesApiResponse.class)
                    .block();

            if (response == null || response.getData() == null || response.getData().isEmpty()) {
                return null;
            }
            return toBigDecimal(response.getData().get(0), 1);
        } catch (Exception e) {
            log.error("Error fetching series {} from datos.gob.ar: {}", seriesId, e.getMessage());
            return null;
        }
    }

    public BCRALiabilitiesData fetchBCRALiabilities() {
        String ids = String.join(",",
                PASIVOS_LETRAS_USD_ID,
                DEPOSITOS_GOBIERNO_ID,
                POSICION_NETA_PASES_ID,
                TIPO_CAMBIO_VAL_ID);
        try {
            SeriesApiResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/series/")
                            .queryParam("ids", ids)
                            .queryParam("limit", 1)
                            .queryParam("sort", "desc")
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(SeriesApiResponse.class)
                    .block();

            if (response == null || response.getData() == null || response.getData().isEmpty()) {
                return null;
            }

            List<Object> row = response.getData().get(0);
            BigDecimal pasivosLetrasPesos = toBigDecimal(row, 1);
            BigDecimal depositosGovPesos = toBigDecimal(row, 2);
            BigDecimal posicionPasesPesos = toBigDecimal(row, 3);
            BigDecimal tipoCambio = toBigDecimal(row, 4);
            if (tipoCambio.compareTo(BigDecimal.ZERO) <= 0) {
                return null;
            }
            BigDecimal pasivosLetrasUsd = pasivosLetrasPesos.divide(tipoCambio, 0, java.math.RoundingMode.HALF_UP);
            BigDecimal depositosGovUsd = depositosGovPesos.divide(tipoCambio, 0, java.math.RoundingMode.HALF_UP);
            BigDecimal posicionPasesUsd = posicionPasesPesos.divide(tipoCambio, 0, java.math.RoundingMode.HALF_UP);
            return new BCRALiabilitiesData(pasivosLetrasUsd, depositosGovUsd, posicionPasesUsd);
        } catch (Exception e) {
            log.error("Error fetching BCRA liabilities from datos.gob.ar: {}", e.getMessage());
            return null;
        }
    }

    private List<SeriesDataPoint> fetchSeries(int limit) {
        try {
            SeriesApiResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/series/")
                            .queryParam("ids", DatosGobArClient.RESERVES_SERIES_ID)
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
                            toBigDecimal(arr, 1)
                    ))
                    .toList();
        } catch (Exception e) {
            log.error("Error fetching series {} from datos.gob.ar: {}", DatosGobArClient.RESERVES_SERIES_ID, e.getMessage());
            return List.of();
        }
    }

    private static BigDecimal toBigDecimal(List<Object> row, int index) {
        if (row == null || index >= row.size()) {
            return BigDecimal.ZERO;
        }
        Object v = row.get(index);
        return v != null ? new BigDecimal(v.toString()) : BigDecimal.ZERO;
    }

    @Data
    public static class BCRALiabilitiesData {
        private final BigDecimal pasivosLetrasUsd;
        private final BigDecimal depositosGobiernoUsd;
        private final BigDecimal posicionNetaPasesUsd;
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
