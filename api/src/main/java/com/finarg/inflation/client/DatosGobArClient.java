package com.finarg.inflation.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private static final String CSV_URL = "https://infra.datos.gob.ar/catalog/sspm/dataset/94/distribution/94.2/download/cer-uva-uvi-diarios.csv";

    public List<SeriesDataPoint> getBCRAReserves(int limit) {
        SeriesApiResponse response = fetchSeriesData(RESERVES_SERIES_ID, limit);
        if (response == null || response.data() == null) {
            return List.of();
        }
        return response.data().stream()
                .map(arr -> new SeriesDataPoint(
                        LocalDate.parse(arr.get(0).toString()),
                        toBigDecimal(arr, 1)
                ))
                .toList();
    }

    public BigDecimal getLatestMinimumSalary() {
        return fetchSingleValue(MINIMUM_SALARY_SERIES_ID);
    }

    public BigDecimal getLatestMinimumPension() {
        return fetchSingleValue(MINIMUM_PENSION_SERIES_ID);
    }

    public BigDecimal getLatestCanastaBasicaTotal() {
        return fetchSingleValue(CANASTA_BASICA_TOTAL_SERIES_ID);
    }

    public BigDecimal getLatestCanastaBasicaAlimentaria() {
        return fetchSingleValue(CANASTA_BASICA_ALIMENTARIA_SERIES_ID);
    }

    public BigDecimal getLatestSalarioRipte() {
        return fetchSingleValue(SALARIO_RIPTE_SERIES_ID);
    }

    public BigDecimal getLatestUva() {
        return fetchLatestCsvValue("uva_diario");
    }

    public BigDecimal getLatestCer() {
        return fetchLatestCsvValue("cer_diario");
    }

    public BCRALiabilitiesData fetchBCRALiabilities() {
        String ids = String.join(",",
                PASIVOS_LETRAS_USD_ID,
                DEPOSITOS_GOBIERNO_ID,
                POSICION_NETA_PASES_ID,
                TIPO_CAMBIO_VAL_ID);

        SeriesApiResponse response = fetchSeriesData(ids, 1);

        if (response == null || response.data() == null || response.data().isEmpty()) {
            return null;
        }

        List<Object> row = response.data().get(0);
        BigDecimal pasivosLetrasPesos = toBigDecimal(row, 1);
        BigDecimal depositosGovPesos = toBigDecimal(row, 2);
        BigDecimal posicionPasesPesos = toBigDecimal(row, 3);
        BigDecimal tipoCambio = toBigDecimal(row, 4);

        if (tipoCambio.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        return new BCRALiabilitiesData(
                pasivosLetrasPesos.divide(tipoCambio, 0, RoundingMode.HALF_UP),
                depositosGovPesos.divide(tipoCambio, 0, RoundingMode.HALF_UP),
                posicionPasesPesos.divide(tipoCambio, 0, RoundingMode.HALF_UP)
        );
    }

    private BigDecimal fetchSingleValue(String seriesId) {
        SeriesApiResponse response = fetchSeriesData(seriesId, 1);
        if (response == null || response.data() == null || response.data().isEmpty()) {
            return null;
        }
        return toBigDecimal(response.data().get(0), 1);
    }

    private SeriesApiResponse fetchSeriesData(String ids, int limit) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/series/")
                            .queryParam("ids", ids)
                            .queryParam("limit", limit)
                            .queryParam("sort", "desc")
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(SeriesApiResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("Error fetching series data for IDs {}: {}", ids, e.getMessage());
            return null;
        }
    }

    private BigDecimal fetchLatestCsvValue(String columnName) {
        try {
            String csvContent = webClient.get()
                    .uri(CSV_URL)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (csvContent == null || csvContent.isEmpty()) {
                return null;
            }

            String[] lines = csvContent.split("\n");
            if (lines.length < 2) {
                return null;
            }

            String[] headers = lines[0].split(",");
            String[] values = lines[lines.length - 1].split(",");

            int columnIndex = -1;
            for (int i = 0; i < headers.length; i++) {
                if (headers[i].trim().equals(columnName)) {
                    columnIndex = i;
                    break;
                }
            }

            if (columnIndex == -1 || columnIndex >= values.length) {
                return null;
            }

            String value = values[columnIndex].trim();
            return value.isEmpty() ? null : new BigDecimal(value);
        } catch (Exception e) {
            log.error("Error fetching CSV value for column {}: {}", columnName, e.getMessage());
            return null;
        }
    }

    private static BigDecimal toBigDecimal(List<Object> row, int index) {
        if (row == null || index >= row.size() || row.get(index) == null) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(row.get(index).toString());
    }

    public record BCRALiabilitiesData(
            BigDecimal pasivosLetrasUsd,
            BigDecimal depositosGobiernoUsd,
            BigDecimal posicionNetaPasesUsd
    ) { }

    public record SeriesApiResponse(List<List<Object>> data, List<SeriesMeta> meta) { }

    public record SeriesMeta(SeriesField field) { }

    public record SeriesField(String description, String units) { }

    public record SeriesDataPoint(LocalDate fecha, BigDecimal valor) { }
}
