package com.finarg.reserves.client;

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

    public BcraClient(
            @Qualifier("bcraWebClient") WebClient webClient,
            @Value("${external.apis.bcra.series.encajes:4}") int serieEncajes) {
        this.webClient = webClient;
        this.serieEncajes = serieEncajes;
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
