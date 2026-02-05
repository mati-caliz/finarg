package com.finarg.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@Slf4j
public class BcraClient {

    private final WebClient webClient;
    private final int serieEncajes;
    private final int serieUva;
    private final int serieCer;

    public BcraClient(
            @Qualifier("bcraWebClient") WebClient webClient,
            @Value("${external.apis.bcra.series.encajes:4}") int serieEncajes,
            @Value("${external.apis.bcra.series.uva:7913}") int serieUva,
            @Value("${external.apis.bcra.series.cer:3540}") int serieCer) {
        this.webClient = webClient;
        this.serieEncajes = serieEncajes;
        this.serieUva = serieUva;
        this.serieCer = serieCer;
    }

    public BigDecimal getUva() {
        return fetchPrincipalVariable(serieUva);
    }

    public BigDecimal getCer() {
        return fetchPrincipalVariable(serieCer);
    }

    private BigDecimal fetchPrincipalVariable(int serie) {
        try {
            String path = "/estadisticas/v2.0/principalesvariables/" + serie;
            List<BcraDataPoint> data = webClient.get()
                    .uri(path)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<BcraDataPoint>>() { })
                    .block();

            if (data == null || data.isEmpty()) {
                return null;
            }
            Object v = data.get(0).getV();
            return v != null ? new BigDecimal(v.toString()) : null;
        } catch (Exception e) {
            log.warn("Could not fetch serie {} from BCRA API: {}", serie, e.getMessage());
            return null;
        }
    }

    public BigDecimal getDepositosEntidadesMonedaExtranjera() {
        try {
            String path = "/estadisticas/v2.0/principalesvariables/" + serieEncajes;
            List<BcraDataPoint> data = webClient.get()
                    .uri(path)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<BcraDataPoint>>() { })
                    .block();

            if (data == null || data.isEmpty()) {
                return null;
            }
            Object v = data.get(0).getV();
            return v != null ? new BigDecimal(v.toString()) : null;
        } catch (Exception e) {
            log.warn("Could not fetch encajes (serie 4) from BCRA API: {}. Using fallback.", e.getMessage());
            return null;
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BcraDataPoint {
        @JsonProperty("d")
        private String fecha;
        @JsonProperty("v")
        private Object v;
    }

}
