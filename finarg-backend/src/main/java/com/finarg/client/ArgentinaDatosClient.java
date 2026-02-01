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
            case "oficial" -> CurrencyType.AR_OFFICIAL;
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

}
