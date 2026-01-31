package com.finarg.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@Slf4j
public class BcraClient {

    private static final int SERIE_ENCABES = 4;

    private final WebClient webClient;

    public BcraClient(@Qualifier("bcraWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public BigDecimal getDepositosEntidadesMonedaExtranjera() {
        try {
            String path = "/estadisticas/v2.0/principalesvariables/" + SERIE_ENCABES;
            List<BcraDataPoint> data = webClient.get()
                    .uri(path)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<BcraDataPoint>>() {})
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
