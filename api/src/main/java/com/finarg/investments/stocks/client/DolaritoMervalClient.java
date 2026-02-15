package com.finarg.investments.stocks.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.List;

@Component
@Slf4j
public class DolaritoMervalClient {
    private final WebClient webClient;

    public DolaritoMervalClient(@Qualifier("dolaritoWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public DolaritoMervalResponse getMervalData() {
        try {
            log.debug("Fetching merval data from dolarito.ar");

            DolaritoMervalResponse response = webClient.get()
                    .uri("/api/frontend/merval")
                    .retrieve()
                    .bodyToMono(DolaritoMervalResponse.class)
                    .block();

            if (response == null) {
                log.warn("No data received from dolarito.ar");
                return new DolaritoMervalResponse();
            }

            log.debug("Received {} cedears, {} etfs, {} stocks",
                    response.getCedears() != null ? response.getCedears().size() : 0,
                    response.getEtfs() != null && response.getEtfs().getBody() != null
                            ? response.getEtfs().getBody().size() : 0,
                    response.getLeadEquity() != null ? response.getLeadEquity().size() : 0);

            return response;
        } catch (Exception e) {
            log.error("Error fetching merval data from dolarito.ar: {}", e.getMessage(), e);
            return new DolaritoMervalResponse();
        }
    }

    @Data
    public static class DolaritoMervalResponse {
        private List<CedearItem> cedears;
        private EtfsWrapper etfs;
        private List<StockItem> leadEquity;
        private List<StockItem> generalEquity;
        private List<BondItem> bonds;
        private List<LetraItem> letras;
        private List<CaucionItem> cauciones;
    }

    @Data
    public static class CedearItem {
        @JsonProperty("nombre")
        private String name;
        @JsonProperty("nombreCorto")
        private String shortName;
        @JsonProperty("maxDia")
        private BigDecimal dayHigh;
        @JsonProperty("minDia")
        private BigDecimal dayLow;
        @JsonProperty("volumen")
        private Long volume;
        @JsonProperty("variacion")
        private BigDecimal variation;
        @JsonProperty("cierreAnterior")
        private BigDecimal previousClose;
        @JsonProperty("precioCompra")
        private BigDecimal bidPrice;
        @JsonProperty("precioVenta")
        private BigDecimal askPrice;
        @JsonProperty("apertura")
        private BigDecimal openPrice;
        @JsonProperty("ultOperado")
        private BigDecimal lastTraded;
        @JsonProperty("ratioDeConversion")
        private Integer conversionRatio;
        private String logo;
        @JsonProperty("moneda")
        private Currency currency;
    }

    @Data
    public static class EtfsWrapper {
        private List<EtfItem> body;
        private Integer count;
        private BigDecimal exectime;
        private String link;
    }

    @Data
    public static class EtfItem {
        @JsonProperty("especie")
        private String ticker;
        @JsonProperty("ultimo")
        private BigDecimal lastPrice;
        @JsonProperty("variacion")
        private BigDecimal variation;
        private BigDecimal varMTD;
        private BigDecimal varYTD;
        @JsonProperty("simbolo")
        private String symbol;
        @JsonProperty("nombre")
        private String name;
        private Long timestamp;
    }

    @Data
    public static class StockItem {
        private String ticker;
        @JsonProperty("nombre")
        private String name;
        @JsonProperty("fechaCotizacion")
        private String quoteDate;
        @JsonProperty("timestampCotizacion")
        private Long quoteTimestamp;
        @JsonProperty("variacion")
        private BigDecimal variation;
        @JsonProperty("cierreAnterior")
        private BigDecimal previousClose;
        @JsonProperty("maxDia")
        private BigDecimal dayHigh;
        @JsonProperty("minDia")
        private BigDecimal dayLow;
        @JsonProperty("moneda")
        private Currency currency;
        @JsonProperty("precioCompra")
        private BigDecimal bidPrice;
        @JsonProperty("precioVenta")
        private BigDecimal askPrice;
        @JsonProperty("ultOperado")
        private BigDecimal lastTraded;
        @JsonProperty("apertura")
        private BigDecimal openPrice;
        @JsonProperty("volumen")
        private Long volume;
    }

    @Data
    public static class BondItem {
        private String ticker;
        @JsonProperty("nombre")
        private String name;
        @JsonProperty("fechaCotizacion")
        private String quoteDate;
        @JsonProperty("timestampCotizacion")
        private Long quoteTimestamp;
        @JsonProperty("variacion")
        private BigDecimal variation;
        @JsonProperty("cierreAnterior")
        private BigDecimal previousClose;
        @JsonProperty("maxDia")
        private BigDecimal dayHigh;
        @JsonProperty("minDia")
        private BigDecimal dayLow;
        @JsonProperty("moneda")
        private Currency currency;
        @JsonProperty("plazo")
        private String term;
        @JsonProperty("precioCompra")
        private BigDecimal bidPrice;
        @JsonProperty("precioVenta")
        private BigDecimal askPrice;
        @JsonProperty("ultOperado")
        private BigDecimal lastTraded;
        @JsonProperty("apertura")
        private BigDecimal openPrice;
        @JsonProperty("volumen")
        private Long volume;
    }

    @Data
    public static class LetraItem {
        private String ticker;
        @JsonProperty("nombre")
        private String name;
        @JsonProperty("nombreCorto")
        private String shortName;
        @JsonProperty("fechaCotizacion")
        private String quoteDate;
        @JsonProperty("timestampCotizacion")
        private Long quoteTimestamp;
        @JsonProperty("variacion")
        private BigDecimal variation;
        @JsonProperty("cierreAnterior")
        private BigDecimal previousClose;
        @JsonProperty("maxDia")
        private BigDecimal dayHigh;
        @JsonProperty("minDia")
        private BigDecimal dayLow;
        @JsonProperty("moneda")
        private Currency currency;
        @JsonProperty("plazo")
        private String term;
        @JsonProperty("precioCompra")
        private BigDecimal bidPrice;
        @JsonProperty("precioVenta")
        private BigDecimal askPrice;
        @JsonProperty("ultOperado")
        private BigDecimal lastTraded;
        @JsonProperty("apertura")
        private BigDecimal openPrice;
        @JsonProperty("volumen")
        private Long volume;
    }

    @Data
    public static class CaucionItem {
        private Integer days;
        private String ticker;
        private BigDecimal variation;
        private BigDecimal lastPrice;
        private BigDecimal minDay;
        private BigDecimal maxDay;
        private BigDecimal closePrevious;
        private Long closeTimestamp;
        private BigDecimal sellPrice;
        private BigDecimal buyPrice;
    }

    @Data
    public static class Currency {
        @JsonProperty("simbolo")
        private String symbol;
        @JsonProperty("descripcion")
        private String description;
        private String id;
    }
}
