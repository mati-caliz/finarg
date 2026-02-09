package com.finarg.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finarg.model.dto.InflationDTO;
import com.finarg.model.entity.QuoteHistory;
import com.finarg.model.enums.Country;
import com.finarg.model.enums.CurrencyType;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class ArgentinaDatosClient {

    private final WebClient webClient;

    public ArgentinaDatosClient(@Qualifier("argentinaDatosWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public List<InflationDTO> getMonthlyInflation(int limit) {
        try {
            log.debug("Fetching inflation data from ArgentinaDatos API, limit: {}", limit);
            
            List<InflationResponse> responses = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/finanzas/indices/inflacion")
                            .build())
                    .retrieve()
                    .bodyToFlux(InflationResponse.class)
                    .collectList()
                    .block();

            if (responses == null || responses.isEmpty()) {
                log.warn("No inflation data received from ArgentinaDatos API");
                return List.of();
            }

            log.debug("Received {} inflation records from API", responses.size());

            int fromIndex = Math.max(0, responses.size() - limit);
            List<InflationDTO> result = responses.subList(fromIndex, responses.size()).stream()
                    .map(this::mapToInflationDTO)
                    .collect(Collectors.toList());
            
            java.util.Collections.reverse(result);
            
            if (!result.isEmpty()) {
                InflationDTO latest = result.get(0);
                log.info("Latest inflation data: {} = {}%", latest.getDate(), latest.getValue());
            }
            
            return result;
        } catch (Exception e) {
            log.error("Error fetching inflation from ArgentinaDatos: {}", e.getMessage(), e);
            return List.of();
        }
    }

    public List<InflationDTO> getYearOverYearInflation() {
        try {
            List<InflationResponse> responses = webClient.get()
                    .uri("/finanzas/indices/inflacionInteranual")
                    .retrieve()
                    .bodyToFlux(InflationResponse.class)
                    .collectList()
                    .block();

            if (responses == null) {
                return List.of();
            }

            return responses.stream()
                    .map(r -> InflationDTO.builder()
                            .date(LocalDate.parse(r.getDate()))
                            .yearOverYear(r.getValue())
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching year over year inflation: {}", e.getMessage());
            return List.of();
        }
    }

    public List<FixedTermRateResponse> getFixedTermRates() {
        try {
            List<FixedTermRateResponse> responses = webClient.get()
                    .uri("/finanzas/tasas/plazoFijo")
                    .retrieve()
                    .bodyToFlux(FixedTermRateResponse.class)
                    .collectList()
                    .block();

            return responses != null ? responses : List.of();
        } catch (Exception e) {
            log.error("Error fetching fixed term rates: {}", e.getMessage());
            return List.of();
        }
    }

    public List<FciRateResponse> getWalletFciRates() {
        try {
            List<FciRateResponse> responses = webClient.get()
                    .uri("/finanzas/fci/otros/ultimo/")
                    .retrieve()
                    .bodyToFlux(FciRateResponse.class)
                    .collectList()
                    .block();

            return responses != null ? responses : List.of();
        } catch (Exception e) {
            log.error("Error fetching wallet FCI rates: {}", e.getMessage());
            return List.of();
        }
    }

    public List<UsdAccountResponse> getUsdAccounts() {
        try {
            List<UsdAccountResponse> responses = webClient.get()
                    .uri("/finanzas/cuentas-remuneradas-usd/")
                    .retrieve()
                    .bodyToFlux(UsdAccountResponse.class)
                    .collectList()
                    .block();

            return responses != null ? responses : List.of();
        } catch (Exception e) {
            log.error("Error fetching USD accounts: {}", e.getMessage());
            return List.of();
        }
    }

    public List<YieldResponse> getYields() {
        try {
            List<YieldResponse> responses = webClient.get()
                    .uri("/finanzas/rendimientos/")
                    .retrieve()
                    .bodyToFlux(YieldResponse.class)
                    .collectList()
                    .block();

            return responses != null ? responses : List.of();
        } catch (Exception e) {
            log.error("Error fetching yields: {}", e.getMessage());
            return List.of();
        }
    }

    public List<UvaMortgageResponse> getUvaMortgages() {
        try {
            List<UvaMortgageResponse> responses = webClient.get()
                    .uri("/finanzas/creditos/hipotecariosUva/")
                    .retrieve()
                    .bodyToFlux(UvaMortgageResponse.class)
                    .collectList()
                    .block();

            return responses != null ? responses : List.of();
        } catch (Exception e) {
            log.error("Error fetching UVA mortgages: {}", e.getMessage());
            return List.of();
        }
    }

    public CountryRiskResponse getLatestCountryRisk() {
        try {
            log.debug("Fetching latest country risk from ArgentinaDatos API");

            CountryRiskResponse response = webClient.get()
                    .uri("/finanzas/indices/riesgo-pais/ultimo")
                    .retrieve()
                    .bodyToMono(CountryRiskResponse.class)
                    .block();

            if (response != null) {
                log.info("Latest country risk: {} points on {}", response.getValue(), response.getDate());
            }

            return response;
        } catch (Exception e) {
            log.error("Error fetching country risk from ArgentinaDatos: {}", e.getMessage());
            return null;
        }
    }

    private InflationDTO mapToInflationDTO(InflationResponse response) {
        return InflationDTO.builder()
                .date(LocalDate.parse(response.getDate()))
                .value(response.getValue())
                .build();
    }

    @Data
    public static class InflationResponse {
        @JsonProperty("fecha")
        private String date;
        @JsonProperty("valor")
        private BigDecimal value;
    }

    public List<QuoteHistory> getCurrencyHistory(String currencyCode, LocalDate from, LocalDate to) {
        record Mapping(String moneda, CurrencyType type) { }
        Mapping m = switch (currencyCode) {
            case "eur_oficial" -> new Mapping("EUR", CurrencyType.AR_EUR_OFICIAL);
            case "brl_oficial" -> new Mapping("BRL", CurrencyType.AR_BRL_OFICIAL);
            case "clp_oficial" -> new Mapping("CLP", CurrencyType.AR_CLP_OFICIAL);
            case "uyu_oficial" -> new Mapping("UYU", CurrencyType.AR_UYU_OFICIAL);
            case "cny_oficial" -> new Mapping("CNY", CurrencyType.AR_CNY_OFICIAL);
            case "pyg_oficial" -> new Mapping("PYG", CurrencyType.AR_PYG_OFICIAL);
            case "bob_oficial" -> new Mapping("BOB", CurrencyType.AR_BOB_OFICIAL);
            default -> null;
        };
        if (m == null) {
            return List.of();
        }
        CurrencyType type = m.type();
        String moneda = m.moneda();
        try {
            List<CotizacionHistoryResponse> responses = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/cotizaciones")
                            .build())
                    .retrieve()
                    .bodyToFlux(CotizacionHistoryResponse.class)
                    .collectList()
                    .block();
            if (responses == null || responses.isEmpty()) {
                return List.of();
            }
            return responses.stream()
                    .filter(r -> moneda.equalsIgnoreCase(r.getMoneda()))
                    .filter(r -> {
                        LocalDate d = LocalDate.parse(r.getFecha());
                        return !d.isBefore(from) && !d.isAfter(to);
                    })
                    .sorted(java.util.Comparator.comparing(CotizacionHistoryResponse::getFecha))
                    .map(r -> QuoteHistory.builder()
                            .type(type)
                            .country(Country.ARGENTINA)
                            .date(LocalDate.parse(r.getFecha()))
                            .buy(r.getCompra() != null ? r.getCompra() : BigDecimal.ZERO)
                            .sell(r.getVenta() != null ? r.getVenta() : BigDecimal.ZERO)
                            .build())
                    .toList();
        } catch (Exception e) {
            log.error("Error fetching {} history from ArgentinaDatos: {}", moneda, e.getMessage());
            return List.of();
        }
    }

    @Data
    public static class CotizacionHistoryResponse {
        private String moneda;
        private BigDecimal compra;
        private BigDecimal venta;
        private String fecha;
    }

    public List<QuoteHistory> getDollarHistory(String exchangeType, LocalDate from, LocalDate to) {
        if (!isValidArgentinaExchange(exchangeType)) {
            return List.of();
        }
        try {
            List<DollarHistoryResponse> responses = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/cotizaciones/dolares/{casa}")
                            .build(exchangeType))
                    .retrieve()
                    .bodyToFlux(DollarHistoryResponse.class)
                    .collectList()
                    .block();

            if (responses == null || responses.isEmpty()) {
                return List.of();
            }

            CurrencyType type = mapExchangeToCurrencyType(exchangeType);
            return responses.stream()
                    .filter(r -> {
                        LocalDate d = LocalDate.parse(r.getDate());
                        return !d.isBefore(from) && !d.isAfter(to);
                    })
                    .sorted(java.util.Comparator.comparing(r -> LocalDate.parse(r.getDate())))
                    .map(r -> QuoteHistory.builder()
                            .type(type)
                            .country(Country.ARGENTINA)
                            .date(LocalDate.parse(r.getDate()))
                            .buy(r.getBuy() != null ? r.getBuy() : BigDecimal.ZERO)
                            .sell(r.getSell() != null ? r.getSell() : BigDecimal.ZERO)
                            .build())
                    .toList();
        } catch (Exception e) {
            log.error("Error fetching dollar history from ArgentinaDatos: {}", e.getMessage());
            return List.of();
        }
    }

    private static boolean isValidArgentinaExchange(String exchangeType) {
        return List.of("oficial", "blue", "bolsa", "contadoconliqui", "mayorista", "tarjeta", "cripto").contains(exchangeType);
    }

    private static CurrencyType mapExchangeToCurrencyType(String exchangeType) {
        return switch (exchangeType) {
            case "blue" -> CurrencyType.AR_BLUE;
            case "bolsa" -> CurrencyType.AR_MEP;
            case "contadoconliqui" -> CurrencyType.AR_CCL;
            case "mayorista" -> CurrencyType.AR_WHOLESALE;
            case "tarjeta" -> CurrencyType.AR_CARD;
            case "cripto" -> CurrencyType.AR_CRYPTO;
            default -> CurrencyType.AR_OFFICIAL;
        };
    }

    @Data
    public static class DollarHistoryResponse {
        @JsonProperty("casa")
        private String source;
        @JsonProperty("compra")
        private BigDecimal buy;
        @JsonProperty("venta")
        private BigDecimal sell;
        @JsonProperty("fecha")
        private String date;
    }

    @Data
    public static class FixedTermRateResponse {
        @JsonProperty("entidad")
        private String entity;
        @JsonProperty("logo")
        private String logo;
        @JsonProperty("tnaClientes")
        private BigDecimal tnaClients;
        @JsonProperty("tnaNoClientes")
        private BigDecimal tnaNonClients;
        @JsonProperty("enlace")
        private String link;
    }

    @Data
    public static class FciRateResponse {
        @JsonProperty("fondo")
        private String fund;
        @JsonProperty("tna")
        private BigDecimal tna;
        @JsonProperty("tea")
        private BigDecimal tea;
        @JsonProperty("tope")
        private BigDecimal limit;
        @JsonProperty("fecha")
        private String date;
        @JsonProperty("condiciones")
        private String conditions;
        @JsonProperty("condicionesCorto")
        private String conditionsShort;
    }

    @Data
    public static class UsdAccountResponse {
        @JsonProperty("entidad")
        private String entity;
        @JsonProperty("tasa")
        private BigDecimal tasa;
        @JsonProperty("tope")
        private BigDecimal limit;
    }

    @Data
    public static class YieldResponse {
        @JsonProperty("entidad")
        private String entity;
        @JsonProperty("rendimientos")
        private List<YieldDetail> rendimientos;
    }

    @Data
    public static class YieldDetail {
        @JsonProperty("moneda")
        private String currency;
        @JsonProperty("apy")
        private BigDecimal apy;
        @JsonProperty("fecha")
        private String date;
    }

    @Data
    public static class UvaMortgageResponse {
        @JsonProperty("entidad")
        private String entity;
        @JsonProperty("nombreComercial")
        private String commercialName;
        @JsonProperty("tna")
        private BigDecimal tna;
    }

    @Data
    public static class CountryRiskResponse {
        @JsonProperty("fecha")
        private String date;
        @JsonProperty("valor")
        private BigDecimal value;
    }

}
