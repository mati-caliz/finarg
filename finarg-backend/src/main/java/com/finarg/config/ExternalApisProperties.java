package com.finarg.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "external.apis")
public class ExternalApisProperties {

    private ApiConfig dolarApi = new ApiConfig();
    private ApiConfig argentinaDatos = new ApiConfig();
    private ApiConfig ambito = new ApiConfig();
    private ApiConfig exchangerate = new ApiConfig();
    private ApiConfig datosGobAr = new ApiConfig();
    private BcraConfig bcra = new BcraConfig();
    private ApiConfig colombia = new ApiConfig();
    private ApiConfig brasil = new ApiConfig();
    private ApiConfig chile = new ApiConfig();
    private ApiConfig uruguay = new ApiConfig();
    private ApiConfig wikidata = new ApiConfig();

    @Data
    public static class ApiConfig {
        private String baseUrl;
        private int timeout = 10000;
    }

    @Data
    public static class BcraConfig {
        private String baseUrl;
        private int timeout = 15000;
        private SeriesConfig series = new SeriesConfig();

        @Data
        public static class SeriesConfig {
            private int encajes = 4;
            private int uva = 7913;
            private int cer = 3540;
        }
    }
}
