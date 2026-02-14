package com.finarg.core.config;

import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import javax.net.ssl.SSLException;
import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Value("${external.apis.dolar-api.base-url}")
    private String dolarApiBaseUrl;

    @Value("${external.apis.dolar-api.timeout:10000}")
    private int dolarApiTimeout;

    @Value("${external.apis.argentina-datos.base-url}")
    private String argentinaDatosBaseUrl;

    @Value("${external.apis.argentina-datos.timeout:10000}")
    private int argentinaDatosTimeout;

    @Value("${external.apis.ambito.base-url:https://mercados.ambito.com}")
    private String ambitoBaseUrl;

    @Value("${external.apis.ambito.timeout:10000}")
    private int ambitoTimeout;

    @Value("${external.apis.exchangerate.base-url:https://open.er-api.com/v6}")
    private String exchangerateBaseUrl;

    @Value("${external.apis.exchangerate.timeout:10000}")
    private int exchangerateTimeout;

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

    @Value("${external.apis.colombia.timeout:10000}")
    private int colombiaApiTimeout;

    @Value("${external.apis.brasil.base-url:https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata}")
    private String brasilApiBaseUrl;

    @Value("${external.apis.brasil.timeout:10000}")
    private int brasilApiTimeout;

    @Value("${external.apis.chile.base-url:https://mindicador.cl/api}")
    private String chileApiBaseUrl;

    @Value("${external.apis.chile.timeout:10000}")
    private int chileApiTimeout;

    @Value("${external.apis.uruguay.base-url:https://www.bcu.gub.uy/api}")
    private String uruguayApiBaseUrl;

    @Value("${external.apis.uruguay.timeout:10000}")
    private int uruguayApiTimeout;

    @Value("${external.apis.wikidata.base-url:https://query.wikidata.org}")
    private String wikidataBaseUrl;

    @Value("${external.apis.wikidata.timeout:15000}")
    private int wikidataTimeout;

    @Value("${external.apis.fci.base-url:https://api.argentinadatos.com}")
    private String fciBaseUrl;

    @Value("${external.apis.fci.timeout:30000}")
    private int fciTimeout;

    @Value("${external.apis.coingecko.base-url:https://api.coingecko.com/api/v3}")
    private String coinGeckoBaseUrl;

    @Value("${external.apis.coingecko.timeout:10000}")
    private int coinGeckoTimeout;

    @Value("${external.apis.metals-api.base-url:https://api.metals.live/v1}")
    private String metalsApiBaseUrl;

    @Value("${external.apis.metals-api.timeout:10000}")
    private int metalsApiTimeout;

    @Value("${external.apis.finnhub.base-url:https://finnhub.io/api/v1}")
    private String finnhubBaseUrl;

    @Value("${external.apis.finnhub.timeout:15000}")
    private int finnhubTimeout;

    @Value("${external.apis.finnhub.api-key:}")
    private String finnhubApiKey;

    @Value("${external.apis.metals-api.api-key:}")
    private String metalsApiKey;

    @Value("${external.apis.iol.base-url:https://api.invertironline.com}")
    private String iolBaseUrl;

    @Value("${external.apis.iol.timeout:15000}")
    private int iolTimeout;

    @Value("${external.apis.dolarito.base-url:https://api.dolarito.ar}")
    private String dolaritoBaseUrl;

    @Value("${external.apis.dolarito.timeout:10000}")
    private int dolaritoTimeout;

    @Value("${external.apis.dolarito.auth-client:f7d471ab0a4ff2b7947759d985ed1db0}")
    private String dolaritoAuthClient;

    @Bean("dolarApiWebClient")
    public WebClient dolarApiWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(dolarApiTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(dolarApiBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("exchangerateWebClient")
    public WebClient exchangerateWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(exchangerateTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(exchangerateBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("ambitoWebClient")
    public WebClient ambitoWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(ambitoTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(ambitoBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("argentinaDatosWebClient")
    public WebClient argentinaDatosWebClient() {
        HttpClient httpClient = HttpClient.create()
                .followRedirect(true)
                .responseTimeout(Duration.ofMillis(argentinaDatosTimeout));
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
        try {
            SslContext sslContext = SslContextBuilder
                    .forClient()
                    .trustManager(InsecureTrustManagerFactory.INSTANCE)
                    .build();

            HttpClient httpClient = HttpClient.create()
                    .responseTimeout(Duration.ofMillis(bcraTimeout))
                    .secure(sslSpec -> sslSpec.sslContext(sslContext));

            return WebClient.builder()
                    .clientConnector(new ReactorClientHttpConnector(httpClient))
                    .baseUrl(bcraBaseUrl)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                    .build();
        } catch (SSLException e) {
            throw new RuntimeException("Failed to create SSL context for BCRA client", e);
        }
    }

    @Bean("colombiaApiWebClient")
    public WebClient colombiaApiWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(colombiaApiTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(colombiaApiBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("brasilApiWebClient")
    public WebClient brasilApiWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(brasilApiTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(brasilApiBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("chileApiWebClient")
    public WebClient chileApiWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(chileApiTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(chileApiBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("uruguayApiWebClient")
    public WebClient uruguayApiWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(uruguayApiTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
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

    @Bean("fciWebClient")
    public WebClient fciWebClient() {
        HttpClient httpClient = HttpClient.create()
                .followRedirect(true)
                .responseTimeout(Duration.ofMillis(fciTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(fciBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.ALL_VALUE)
                .defaultHeader("User-Agent", "Finarg/1.0")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }

    @Bean("coinGeckoWebClient")
    public WebClient coinGeckoWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(coinGeckoTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(coinGeckoBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("User-Agent", "Finarg/1.0")
                .build();
    }

    @Bean("zonapropWebClient")
    public WebClient zonapropWebClient() {
        HttpClient httpClient = HttpClient.create()
                .followRedirect(true)
                .responseTimeout(Duration.ofMillis(20000));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl("https://www.zonaprop.com.ar")
                .defaultHeader(HttpHeaders.USER_AGENT,
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                    + "Chrome/131.0.0.0 Safari/537.36")
                .defaultHeader(HttpHeaders.ACCEPT,
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "es-AR,es;q=0.9,en;q=0.8")
                .defaultHeader(HttpHeaders.ACCEPT_ENCODING, "gzip, deflate, br")
                .defaultHeader(HttpHeaders.CONNECTION, "keep-alive")
                .defaultHeader(HttpHeaders.REFERER, "https://www.zonaprop.com.ar/")
                .defaultHeader("Upgrade-Insecure-Requests", "1")
                .defaultHeader("Sec-Fetch-Dest", "document")
                .defaultHeader("Sec-Fetch-Mode", "navigate")
                .defaultHeader("Sec-Fetch-Site", "same-origin")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }

    @Bean("metalsApiWebClient")
    public WebClient metalsApiWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(metalsApiTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(metalsApiBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean("finnhubWebClient")
    public WebClient finnhubWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(finnhubTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(finnhubBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("X-Finnhub-Token", finnhubApiKey)
                .build();
    }

    @Bean("iolWebClient")
    public WebClient iolWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(iolTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(iolBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.USER_AGENT, "Finarg/1.0")
                .build();
    }

    @Bean("dolaritoWebClient")
    public WebClient dolaritoWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(dolaritoTimeout));
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(dolaritoBaseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, "application/json, text/plain, */*")
                .defaultHeader("auth-client", dolaritoAuthClient)
                .defaultHeader("origin", "https://www.dolarito.ar")
                .defaultHeader("referer", "https://www.dolarito.ar/")
                .build();
    }
}
