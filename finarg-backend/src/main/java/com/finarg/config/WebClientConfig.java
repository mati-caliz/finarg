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

    @Value("${external.apis.colombia.base-url:https://www.datos.gov.co/api}")
    private String colombiaApiBaseUrl;

    @Value("${external.apis.brasil.base-url:https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata}")
    private String brasilApiBaseUrl;

    @Value("${external.apis.chile.base-url:https://mindicador.cl/api}")
    private String chileApiBaseUrl;

    @Value("${external.apis.uruguay.base-url:https://www.bcu.gub.uy/api}")
    private String uruguayApiBaseUrl;

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

    @Bean("colombiaApiWebClient")
    public WebClient colombiaApiWebClient() {
        return WebClient.builder()
                .baseUrl(colombiaApiBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("brasilApiWebClient")
    public WebClient brasilApiWebClient() {
        return WebClient.builder()
                .baseUrl(brasilApiBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("chileApiWebClient")
    public WebClient chileApiWebClient() {
        return WebClient.builder()
                .baseUrl(chileApiBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("uruguayApiWebClient")
    public WebClient uruguayApiWebClient() {
        return WebClient.builder()
                .baseUrl(uruguayApiBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
