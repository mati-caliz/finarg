package com.finarg.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Value("${external.apis.dolar-api.base-url}")
    private String dolarApiBaseUrl;

    @Value("${external.apis.argentina-datos.base-url}")
    private String argentinaDatosBaseUrl;

    @Value("${external.apis.ambito.base-url:https://mercados.ambito.com}")
    private String ambitoBaseUrl;

    @Value("${external.apis.exchangerate.base-url:https://open.er-api.com/v6}")
    private String exchangerateBaseUrl;

    @Value("${external.apis.datos-gob-ar.base-url}")
    private String datosGobArBaseUrl;

    @Value("${external.apis.datos-gob-ar.timeout:60000}")
    private int datosGobArTimeout;

    @Value("${external.apis.bcra.base-url:https://api.bcra.gob.ar}")
    private String bcraBaseUrl;

    @Value("${external.apis.bcra.timeout:15000}")
    private int bcraTimeout;

    @Value("${external.apis.colombia.base-url:https://www.datos.gov.co/api}")
    private String colombiaApiBaseUrl;

    @Value("${external.apis.brasil.base-url:https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata}")
    private String brasilApiBaseUrl;

    @Value("${external.apis.chile.base-url:https://mindicador.cl/api}")
    private String chileApiBaseUrl;

    @Value("${external.apis.uruguay.base-url:https://www.bcu.gub.uy/api}")
    private String uruguayApiBaseUrl;

    @Value("${external.apis.wikidata.base-url:https://query.wikidata.org}")
    private String wikidataBaseUrl;

    @Value("${external.apis.wikidata.timeout:15000}")
    private int wikidataTimeout;

    @Bean("dolarApiWebClient")
    public WebClient dolarApiWebClient() {
        return WebClient.builder()
                .baseUrl(dolarApiBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("exchangerateWebClient")
    public WebClient exchangerateWebClient() {
        return WebClient.builder()
                .baseUrl(exchangerateBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("ambitoWebClient")
    public WebClient ambitoWebClient() {
        return WebClient.builder()
                .baseUrl(ambitoBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("argentinaDatosWebClient")
    public WebClient argentinaDatosWebClient() {
        HttpClient httpClient = HttpClient.create()
                .followRedirect(true)
                .responseTimeout(Duration.ofSeconds(30));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(argentinaDatosBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.ALL_VALUE)
                .defaultHeader("User-Agent", "Finarg/1.0")
                .defaultHeader("Referer", "https://comparatasas.ar/")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }

    @Bean("datosGobArWebClient")
    public WebClient datosGobArWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(datosGobArTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(datosGobArBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("bcraWebClient")
    public WebClient bcraWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(bcraTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(bcraBaseUrl)
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

    @Bean("wikidataWebClient")
    public WebClient wikidataWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(wikidataTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(wikidataBaseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, "application/sparql-results+json, application/json")
                .defaultHeader("User-Agent", "Finarg/1.0 (https://finarg.app)")
                .build();
    }
}
