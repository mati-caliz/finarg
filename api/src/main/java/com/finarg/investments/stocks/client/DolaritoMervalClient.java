package com.finarg.investments.stocks.client;

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
        private String nombre;
        private String nombreCorto;
        private BigDecimal maxDia;
        private BigDecimal minDia;
        private Long volumen;
        private BigDecimal variacion;
        private BigDecimal cierreAnterior;
        private BigDecimal precioCompra;
        private BigDecimal precioVenta;
        private BigDecimal apertura;
        private BigDecimal ultOperado;
        private Integer ratioDeConversion;
        private String logo;
        private Moneda moneda;
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
        private String especie;
        private BigDecimal ultimo;
        private BigDecimal variacion;
        private BigDecimal varMTD;
        private BigDecimal varYTD;
        private String simbolo;
        private String nombre;
        private Long timestamp;
    }

    @Data
    public static class StockItem {
        private String ticker;
        private String nombre;
        private String fechaCotizacion;
        private Long timestampCotizacion;
        private BigDecimal variacion;
        private BigDecimal cierreAnterior;
        private BigDecimal maxDia;
        private BigDecimal minDia;
        private Moneda moneda;
        private BigDecimal precioCompra;
        private BigDecimal precioVenta;
        private BigDecimal ultOperado;
        private BigDecimal apertura;
        private Long volumen;
    }

    @Data
    public static class BondItem {
        private String ticker;
        private String nombre;
        private String fechaCotizacion;
        private Long timestampCotizacion;
        private BigDecimal variacion;
        private BigDecimal cierreAnterior;
        private BigDecimal maxDia;
        private BigDecimal minDia;
        private Moneda moneda;
        private String plazo;
        private BigDecimal precioCompra;
        private BigDecimal precioVenta;
        private BigDecimal ultOperado;
        private BigDecimal apertura;
        private Long volumen;
    }

    @Data
    public static class LetraItem {
        private String ticker;
        private String nombre;
        private String nombreCorto;
        private String fechaCotizacion;
        private Long timestampCotizacion;
        private BigDecimal variacion;
        private BigDecimal cierreAnterior;
        private BigDecimal maxDia;
        private BigDecimal minDia;
        private Moneda moneda;
        private String plazo;
        private BigDecimal precioCompra;
        private BigDecimal precioVenta;
        private BigDecimal ultOperado;
        private BigDecimal apertura;
        private Long volumen;
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
    public static class Moneda {
        private String simbolo;
        private String descripcion;
        private String id;
    }
}
