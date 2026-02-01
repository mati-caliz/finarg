package com.finarg.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finarg.model.dto.QuoteDTO;
import com.finarg.model.enums.Country;
import com.finarg.model.enums.CurrencyType;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

@Slf4j
@Component
public class ArgentinaQuoteClient implements QuoteClient {

    private final WebClient webClient;
    private final AmbitoClient ambitoClient;
    private final ExchangerateApiClient exchangerateApiClient;

    public ArgentinaQuoteClient(
            @Qualifier("dolarApiWebClient") WebClient webClient,
            AmbitoClient ambitoClient,
            ExchangerateApiClient exchangerateApiClient) {
        this.webClient = webClient;
        this.ambitoClient = ambitoClient;
        this.exchangerateApiClient = exchangerateApiClient;
    }

    @Override
    public Country getCountry() {
        return Country.ARGENTINA;
    }

    @Override
    public List<QuoteDTO> getAllQuotes() {
        java.util.List<QuoteDTO> result = new java.util.ArrayList<>();
        try {
            List<DolarApiResponse> dollarResponses = webClient.get()
                    .uri("/dolares")
                    .retrieve()
                    .bodyToFlux(DolarApiResponse.class)
                    .collectList()
                    .block();
            if (dollarResponses != null) {
                result.addAll(dollarResponses.stream()
                        .map(this::mapToQuoteDTO)
                        .toList());
            }

            List<CotizacionApiResponse> cotizaciones = webClient.get()
                    .uri("/cotizaciones")
                    .retrieve()
                    .bodyToFlux(CotizacionApiResponse.class)
                    .collectList()
                    .block();
            CotizacionApiResponse clpOficial = null;
            CotizacionApiResponse uyuOficial = null;
            if (cotizaciones != null) {
                for (CotizacionApiResponse c : cotizaciones) {
                    if ("BRL".equalsIgnoreCase(c.getMoneda())) {
                        result.add(mapCotizacionToQuoteDTO(c, CurrencyType.AR_BRL_OFICIAL, "Real"));
                    } else if ("CLP".equalsIgnoreCase(c.getMoneda())) {
                        clpOficial = c;
                        result.add(mapCotizacionToQuoteDTO(c, CurrencyType.AR_CLP_OFICIAL, "Peso Chileno"));
                    } else if ("UYU".equalsIgnoreCase(c.getMoneda())) {
                        uyuOficial = c;
                        result.add(mapCotizacionToQuoteDTO(c, CurrencyType.AR_UYU_OFICIAL, "Peso Uruguayo"));
                    }
                }
            }

            DolarApiResponse dollarBlue = dollarResponses != null
                    ? dollarResponses.stream().filter(d -> "blue".equalsIgnoreCase(d.getCasa())).findFirst().orElse(null)
                    : null;
            DolarApiResponse dollarOficial = dollarResponses != null
                    ? dollarResponses.stream().filter(d -> "oficial".equalsIgnoreCase(d.getCasa())).findFirst().orElse(null)
                    : null;
            addDerivedBlueQuotes(result, dollarBlue, dollarOficial, clpOficial, uyuOficial);
            addCrossOficialQuotes(result, dollarOficial);

            ambitoClient.getEuroOficialQuote().ifPresent(result::add);
            ambitoClient.getEuroBlueQuote().ifPresent(result::add);
        } catch (Exception e) {
            log.error("Error fetching quotes from DolarAPI: {}", e.getMessage());
        }
        return result;
    }

    @Override
    public QuoteDTO getQuote(CurrencyType type) {
        if (type == CurrencyType.AR_EUR_OFICIAL) {
            return ambitoClient.getEuroOficialQuote()
                    .orElseGet(this::fetchEuroOficialFromDolarApi);
        }
        if (type == CurrencyType.AR_EUR_BLUE) {
            return ambitoClient.getEuroBlueQuote().orElse(null);
        }
        if (type == CurrencyType.AR_CLP_BLUE || type == CurrencyType.AR_UYU_BLUE) {
            return computeDerivedBlueQuote(type);
        }
        if (type == CurrencyType.AR_PYG_OFICIAL || type == CurrencyType.AR_BOB_OFICIAL
                || type == CurrencyType.AR_CNY_OFICIAL) {
            List<QuoteDTO> all = getAllQuotes();
            return all.stream().filter(q -> q.getType() == type).findFirst().orElse(null);
        }
        if (type == CurrencyType.AR_BRL_OFICIAL || type == CurrencyType.AR_CLP_OFICIAL
                || type == CurrencyType.AR_UYU_OFICIAL) {
            String moneda = switch (type) {
                case AR_BRL_OFICIAL -> "brl";
                case AR_CLP_OFICIAL -> "clp";
                case AR_UYU_OFICIAL -> "uyu";
                default -> "usd";
            };
            String name = switch (type) {
                case AR_BRL_OFICIAL -> "Real";
                case AR_CLP_OFICIAL -> "Peso Chileno";
                case AR_UYU_OFICIAL -> "Peso Uruguayo";
                default -> "USD";
            };
            try {
                CotizacionApiResponse response = webClient.get()
                        .uri("/cotizaciones/{moneda}", moneda)
                        .retrieve()
                        .bodyToMono(CotizacionApiResponse.class)
                        .block();
                return response != null ? mapCotizacionToQuoteDTO(response, type, name) : null;
            } catch (Exception e) {
                log.error("Error fetching quote {}: {}", type, e.getMessage());
                return null;
            }
        }
        try {
            DolarApiResponse response = webClient.get()
                    .uri("/dolares/{tipo}", type.getCode())
                    .retrieve()
                    .bodyToMono(DolarApiResponse.class)
                    .block();
            return response != null ? mapToQuoteDTO(response) : null;
        } catch (Exception e) {
            log.error("Error fetching quote {}: {}", type, e.getMessage());
            return null;
        }
    }

    private QuoteDTO mapToQuoteDTO(DolarApiResponse response) {
        BigDecimal buy = response.getCompra() != null ? response.getCompra() : BigDecimal.ZERO;
        BigDecimal sell = response.getVenta() != null ? response.getVenta() : BigDecimal.ZERO;
        BigDecimal spread = sell.subtract(buy);

        CurrencyType type;
        try {
            type = CurrencyType.fromCode(response.getCasa(), Country.ARGENTINA);
        } catch (IllegalArgumentException e) {
            type = CurrencyType.AR_OFFICIAL;
        }

        LocalDateTime lastUpdate = LocalDateTime.now();
        if (response.getFechaActualizacion() != null) {
            try {
                lastUpdate = ZonedDateTime.parse(response.getFechaActualizacion()).toLocalDateTime();
            } catch (Exception ignored) {
            }
        }

        return QuoteDTO.builder()
                .type(type)
                .country(Country.ARGENTINA)
                .name(response.getNombre())
                .buy(buy)
                .sell(sell)
                .spread(spread)
                .variation(BigDecimal.ZERO)
                .lastUpdate(lastUpdate)
                .build();
    }

    private QuoteDTO computeDerivedBlueQuote(CurrencyType type) {
        try {
            List<DolarApiResponse> dollarResponses = webClient.get()
                    .uri("/dolares")
                    .retrieve()
                    .bodyToFlux(DolarApiResponse.class)
                    .collectList()
                    .block();
            List<CotizacionApiResponse> cotizaciones = webClient.get()
                    .uri("/cotizaciones")
                    .retrieve()
                    .bodyToFlux(CotizacionApiResponse.class)
                    .collectList()
                    .block();
            DolarApiResponse dollarBlue = dollarResponses != null
                    ? dollarResponses.stream().filter(d -> "blue".equalsIgnoreCase(d.getCasa())).findFirst().orElse(null)
                    : null;
            DolarApiResponse dollarOficial = dollarResponses != null
                    ? dollarResponses.stream().filter(d -> "oficial".equalsIgnoreCase(d.getCasa())).findFirst().orElse(null)
                    : null;
            CotizacionApiResponse clpOficial = cotizaciones != null
                    ? cotizaciones.stream().filter(c -> "CLP".equalsIgnoreCase(c.getMoneda())).findFirst().orElse(null)
                    : null;
            CotizacionApiResponse uyuOficial = cotizaciones != null
                    ? cotizaciones.stream().filter(c -> "UYU".equalsIgnoreCase(c.getMoneda())).findFirst().orElse(null)
                    : null;
            java.util.List<QuoteDTO> temp = new java.util.ArrayList<>();
            addDerivedBlueQuotes(temp, dollarBlue, dollarOficial, clpOficial, uyuOficial);
            return temp.stream().filter(q -> q.getType() == type).findFirst().orElse(null);
        } catch (Exception e) {
            log.error("Error computing derived blue quote {}: {}", type, e.getMessage());
            return null;
        }
    }

    private void addCrossOficialQuotes(java.util.List<QuoteDTO> result, DolarApiResponse dollarOficial) {
        if (dollarOficial == null) {
            return;
        }
        BigDecimal oficialSell = dollarOficial.getVenta() != null ? dollarOficial.getVenta() : BigDecimal.ZERO;
        BigDecimal oficialBuy = dollarOficial.getCompra() != null ? dollarOficial.getCompra() : BigDecimal.ZERO;
        if (oficialSell.compareTo(BigDecimal.ZERO) <= 0 || oficialBuy.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        exchangerateApiClient.getUsdRates().ifPresent(rates -> {
            addCrossQuote(result, dollarOficial, rates, "PYG", CurrencyType.AR_PYG_OFICIAL, "Guaraní Paraguayo");
            addCrossQuote(result, dollarOficial, rates, "BOB", CurrencyType.AR_BOB_OFICIAL, "Boliviano");
            addCrossQuote(result, dollarOficial, rates, "CNY", CurrencyType.AR_CNY_OFICIAL, "Yuan");
        });
    }

    private void addCrossQuote(
            java.util.List<QuoteDTO> result,
            DolarApiResponse dollarOficial,
            java.util.Map<String, BigDecimal> usdRates,
            String currencyCode,
            CurrencyType type,
            String name) {
        BigDecimal usdPerCurrency = usdRates.get(currencyCode);
        if (usdPerCurrency == null || usdPerCurrency.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        BigDecimal oficialSell = dollarOficial.getVenta() != null ? dollarOficial.getVenta() : BigDecimal.ZERO;
        BigDecimal oficialBuy = dollarOficial.getCompra() != null ? dollarOficial.getCompra() : BigDecimal.ZERO;
        BigDecimal arsPerCurrencySell = oficialSell.divide(usdPerCurrency, 6, RoundingMode.HALF_UP);
        BigDecimal arsPerCurrencyBuy = oficialBuy.divide(usdPerCurrency, 6, RoundingMode.HALF_UP);
        LocalDateTime lastUpdate = LocalDateTime.now();
        if (dollarOficial.getFechaActualizacion() != null) {
            try {
                lastUpdate = ZonedDateTime.parse(dollarOficial.getFechaActualizacion()).toLocalDateTime();
            } catch (Exception ignored) {
            }
        }
        result.add(QuoteDTO.builder()
                .type(type)
                .country(Country.ARGENTINA)
                .name(name + " Oficial")
                .buy(arsPerCurrencyBuy)
                .sell(arsPerCurrencySell)
                .spread(arsPerCurrencySell.subtract(arsPerCurrencyBuy))
                .variation(BigDecimal.ZERO)
                .lastUpdate(lastUpdate)
                .build());
    }

    private void addDerivedBlueQuotes(
            java.util.List<QuoteDTO> result,
            DolarApiResponse dollarBlue,
            DolarApiResponse dollarOficial,
            CotizacionApiResponse clpOficial,
            CotizacionApiResponse uyuOficial) {
        if (dollarBlue == null || dollarOficial == null) {
            return;
        }
        BigDecimal blueSell = dollarBlue.getVenta() != null ? dollarBlue.getVenta() : BigDecimal.ZERO;
        BigDecimal blueBuy = dollarBlue.getCompra() != null ? dollarBlue.getCompra() : BigDecimal.ZERO;
        BigDecimal oficialSell = dollarOficial.getVenta() != null ? dollarOficial.getVenta() : BigDecimal.ONE;
        BigDecimal oficialBuy = dollarOficial.getCompra() != null ? dollarOficial.getCompra() : BigDecimal.ONE;

        LocalDateTime lastUpdate = LocalDateTime.now();
        if (dollarBlue.getFechaActualizacion() != null) {
            try {
                lastUpdate = ZonedDateTime.parse(dollarBlue.getFechaActualizacion()).toLocalDateTime();
            } catch (Exception ignored) {
            }
        }

        if (clpOficial != null) {
            BigDecimal clpOficialSell = clpOficial.getVenta() != null ? clpOficial.getVenta() : BigDecimal.ZERO;
            BigDecimal clpOficialBuy = clpOficial.getCompra() != null ? clpOficial.getCompra() : BigDecimal.ZERO;
            if (clpOficialSell.compareTo(BigDecimal.ZERO) > 0 && clpOficialBuy.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal usdPerClp = oficialSell.divide(clpOficialSell, 6, RoundingMode.HALF_UP);
                BigDecimal clpBlueSell = blueSell.divide(usdPerClp, 4, RoundingMode.HALF_UP);
                usdPerClp = oficialBuy.divide(clpOficialBuy, 6, RoundingMode.HALF_UP);
                BigDecimal clpBlueBuy = blueBuy.divide(usdPerClp, 4, RoundingMode.HALF_UP);
                result.add(QuoteDTO.builder()
                        .type(CurrencyType.AR_CLP_BLUE)
                        .country(Country.ARGENTINA)
                        .name("Peso Chileno Blue")
                        .buy(clpBlueBuy)
                        .sell(clpBlueSell)
                        .spread(clpBlueSell.subtract(clpBlueBuy))
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(lastUpdate)
                        .build());
            }
        }

        if (uyuOficial != null) {
            BigDecimal uyuOficialSell = uyuOficial.getVenta() != null ? uyuOficial.getVenta() : BigDecimal.ZERO;
            BigDecimal uyuOficialBuy = uyuOficial.getCompra() != null ? uyuOficial.getCompra() : BigDecimal.ZERO;
            if (uyuOficialSell.compareTo(BigDecimal.ZERO) > 0 && uyuOficialBuy.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal usdPerUyu = oficialSell.divide(uyuOficialSell, 6, RoundingMode.HALF_UP);
                BigDecimal uyuBlueSell = blueSell.divide(usdPerUyu, 4, RoundingMode.HALF_UP);
                usdPerUyu = oficialBuy.divide(uyuOficialBuy, 6, RoundingMode.HALF_UP);
                BigDecimal uyuBlueBuy = blueBuy.divide(usdPerUyu, 4, RoundingMode.HALF_UP);
                result.add(QuoteDTO.builder()
                        .type(CurrencyType.AR_UYU_BLUE)
                        .country(Country.ARGENTINA)
                        .name("Peso Uruguayo Blue")
                        .buy(uyuBlueBuy)
                        .sell(uyuBlueSell)
                        .spread(uyuBlueSell.subtract(uyuBlueBuy))
                        .variation(BigDecimal.ZERO)
                        .lastUpdate(lastUpdate)
                        .build());
            }
        }
    }

    private QuoteDTO fetchEuroOficialFromDolarApi() {
        try {
            CotizacionApiResponse response = webClient.get()
                    .uri("/cotizaciones/eur")
                    .retrieve()
                    .bodyToMono(CotizacionApiResponse.class)
                    .block();
            return response != null ? mapCotizacionToQuoteDTO(response, CurrencyType.AR_EUR_OFICIAL, "Euro Oficial") : null;
        } catch (Exception e) {
            log.error("Error fetching Euro Oficial from DolarAPI: {}", e.getMessage());
            return null;
        }
    }

    private QuoteDTO mapCotizacionToQuoteDTO(CotizacionApiResponse c, CurrencyType type, String name) {
        BigDecimal buy = c.getCompra() != null ? c.getCompra() : BigDecimal.ZERO;
        BigDecimal sell = c.getVenta() != null ? c.getVenta() : BigDecimal.ZERO;
        LocalDateTime lastUpdate = LocalDateTime.now();
        if (c.getFechaActualizacion() != null) {
            try {
                lastUpdate = ZonedDateTime.parse(c.getFechaActualizacion()).toLocalDateTime();
            } catch (Exception ignored) {
            }
        }
        return QuoteDTO.builder()
                .type(type)
                .country(Country.ARGENTINA)
                .name(name)
                .buy(buy)
                .sell(sell)
                .spread(sell.subtract(buy))
                .variation(BigDecimal.ZERO)
                .lastUpdate(lastUpdate)
                .build();
    }

    @Data
    public static class DolarApiResponse {
        private String moneda;
        private String casa;
        private String nombre;
        private BigDecimal compra;
        private BigDecimal venta;
        @JsonProperty("fechaActualizacion")
        private String fechaActualizacion;
    }

    @Data
    public static class CotizacionApiResponse {
        private String moneda;
        private String casa;
        private String nombre;
        private BigDecimal compra;
        private BigDecimal venta;
        @JsonProperty("fechaActualizacion")
        private String fechaActualizacion;
    }
}
