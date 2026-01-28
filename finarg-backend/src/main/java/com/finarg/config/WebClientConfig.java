package com.finarg.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${external.apis.dolar-api.base-url}")
    private String dolarApiBaseUrl;

    @Value("${external.apis.argentina-datos.base-url}")
    private String argentinaDatosBaseUrl;

    @Value("${external.apis.datos-gob-ar.base-url}")
    private String datosGobArBaseUrl;

    @Bean("dolarApiWebClient")
    public WebClient dolarApiWebClient() {
        return WebClient.builder()
                .baseUrl(dolarApiBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("argentinaDatosWebClient")
    public WebClient argentinaDatosWebClient() {
        return WebClient.builder()
                .baseUrl(argentinaDatosBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("datosGobArWebClient")
    public WebClient datosGobArWebClient() {
        return WebClient.builder()
                .baseUrl(datosGobArBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
