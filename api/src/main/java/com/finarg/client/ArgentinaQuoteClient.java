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
import java.util.*;

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
        List<QuoteDTO> result = new ArrayList<>();
        try {
            MarketDataSnapshot marketData = fetchMarketData();

            if (marketData.dollarResponses != null) {
                result.addAll(marketData.dollarResponses.stream()
                        .map(this::mapToQuoteDTO)
                        .toList());
            }

            addOfficialCotizaciones(result, marketData.cotizaciones);

            addDerivedQuotes(result, marketData, "blue", CurrencyType.AR_CLP_BLUE, CurrencyType.AR_UYU_BLUE);
            addDerivedQuotes(result, marketData, "tarjeta", CurrencyType.AR_CLP_TARJETA, CurrencyType.AR_UYU_TARJETA);

            addCrossQuotesBatch(result, marketData);

            ambitoClient.getEuroOficialQuote().ifPresent(result::add);
            ambitoClient.getEuroBlueQuote().ifPresent(result::add);

        } catch (Exception e) {
            log.error("Error generating all quotes: {}", e.getMessage());
        }
        return result;
    }

    @Override
    public QuoteDTO getQuote(CurrencyType type) {
        if (type == CurrencyType.AR_EUR_OFICIAL) return ambitoClient.getEuroOficialQuote().orElseGet(this::fetchEuroOficialFromDolarApi);
        if (type == CurrencyType.AR_EUR_BLUE) return ambitoClient.getEuroBlueQuote().orElse(null);

        if (isDerivedType(type)) {
            MarketDataSnapshot marketData = fetchMarketData();
            if (isBlueDerived(type)) {
                return findDerivedQuote(marketData, "blue", CurrencyType.AR_CLP_BLUE, CurrencyType.AR_UYU_BLUE, type);
            } else {
                return findDerivedQuote(marketData, "tarjeta", CurrencyType.AR_CLP_TARJETA, CurrencyType.AR_UYU_TARJETA, type);
            }
        }

        if (isCrossType(type)) {
            return getAllQuotes().stream().filter(q -> q.getType() == type).findFirst().orElse(null);
        }

        return fetchSingleQuote(type);
    }

    private MarketDataSnapshot fetchMarketData() {
        List<DolarApiResponse> dollars = webClient.get().uri("/dolares").retrieve()
                .bodyToFlux(DolarApiResponse.class).collectList().block();
        List<CotizacionApiResponse> cotizaciones = webClient.get().uri("/cotizaciones").retrieve()
                .bodyToFlux(CotizacionApiResponse.class).collectList().block();
        return new MarketDataSnapshot(dollars, cotizaciones);
    }

    private QuoteDTO fetchSingleQuote(CurrencyType type) {
        try {
            if (type == CurrencyType.AR_CLP_OFICIAL || type == CurrencyType.AR_UYU_OFICIAL) {
                String endpoint = (type == CurrencyType.AR_CLP_OFICIAL) ? "clp" : "uyu";
                String name = (type == CurrencyType.AR_CLP_OFICIAL) ? "Peso Chileno" : "Peso Uruguayo";
                return webClient.get().uri("/cotizaciones/" + endpoint).retrieve()
                        .bodyToMono(CotizacionApiResponse.class)
                        .map(r -> mapCotizacionToQuoteDTO(r, type, name))
                        .block();
            } else {
                return webClient.get().uri("/dolares/" + type.getCode()).retrieve()
                        .bodyToMono(DolarApiResponse.class)
                        .map(this::mapToQuoteDTO)
                        .block();
            }
        } catch (Exception e) {
            log.error("Error fetching single quote {}: {}", type, e.getMessage());
            return null;
        }
    }

    private void addOfficialCotizaciones(List<QuoteDTO> result, List<CotizacionApiResponse> cotizaciones) {
        if (cotizaciones == null) return;
        findCotizacion(cotizaciones, "CLP").ifPresent(c -> result.add(mapCotizacionToQuoteDTO(c, CurrencyType.AR_CLP_OFICIAL, "Peso Chileno")));
        findCotizacion(cotizaciones, "UYU").ifPresent(c -> result.add(mapCotizacionToQuoteDTO(c, CurrencyType.AR_UYU_OFICIAL, "Peso Uruguayo")));
    }

    private void addDerivedQuotes(List<QuoteDTO> result, MarketDataSnapshot data, String baseTypeStr, CurrencyType clpType, CurrencyType uyuType) {
        DolarApiResponse baseDollar = findDolar(data.dollarResponses, baseTypeStr); // e.g., Blue or Tarjeta
        DolarApiResponse officialDollar = findDolar(data.dollarResponses, "oficial");

        if (baseDollar == null || officialDollar == null) return;

        findCotizacion(data.cotizaciones, "CLP").ifPresent(clp ->
                result.add(calculateDerivedRate(baseDollar, officialDollar, clp, clpType, "Peso Chileno " + capitalize(baseTypeStr)))
        );
        findCotizacion(data.cotizaciones, "UYU").ifPresent(uyu ->
                result.add(calculateDerivedRate(baseDollar, officialDollar, uyu, uyuType, "Peso Uruguayo " + capitalize(baseTypeStr)))
        );
    }

    private QuoteDTO findDerivedQuote(MarketDataSnapshot data, String baseTypeStr, CurrencyType clpType, CurrencyType uyuType, CurrencyType target) {
        List<QuoteDTO> temp = new ArrayList<>();
        addDerivedQuotes(temp, data, baseTypeStr, clpType, uyuType);
        return temp.stream().filter(q -> q.getType() == target).findFirst().orElse(null);
    }

    private QuoteDTO calculateDerivedRate(DolarApiResponse base, DolarApiResponse official, CotizacionApiResponse targetOfficial, CurrencyType type, String name) {
        BigDecimal officialSell = safeValue(official.getVenta(), BigDecimal.ONE);
        BigDecimal officialBuy = safeValue(official.getCompra(), BigDecimal.ONE);
        BigDecimal targetSell = safeValue(targetOfficial.getVenta(), BigDecimal.ZERO);
        BigDecimal targetBuy = safeValue(targetOfficial.getCompra(), BigDecimal.ZERO);
        BigDecimal baseSell = safeValue(base.getVenta(), BigDecimal.ZERO);
        BigDecimal baseBuy = safeValue(base.getCompra(), BigDecimal.ZERO);

        if (targetSell.compareTo(BigDecimal.ZERO) == 0 || targetBuy.compareTo(BigDecimal.ZERO) == 0) return null;

        BigDecimal usdPerTargetSell = officialSell.divide(targetSell, 6, RoundingMode.HALF_UP);
        BigDecimal derivedSell = baseSell.divide(usdPerTargetSell, 4, RoundingMode.HALF_UP);

        BigDecimal usdPerTargetBuy = officialBuy.divide(targetBuy, 6, RoundingMode.HALF_UP);
        BigDecimal derivedBuy = baseBuy.divide(usdPerTargetBuy, 4, RoundingMode.HALF_UP);

        return QuoteDTO.builder()
                .type(type)
                .country(Country.ARGENTINA)
                .name(name)
                .buy(derivedBuy)
                .sell(derivedSell)
                .spread(derivedSell.subtract(derivedBuy))
                .variation(BigDecimal.ZERO)
                .lastUpdate(parseDate(base.getFechaActualizacion()))
                .build();
    }

    private void addCrossQuotesBatch(List<QuoteDTO> result, MarketDataSnapshot data) {
        exchangerateApiClient.getUsdRates().ifPresent(rates -> {
            DolarApiResponse official = findDolar(data.dollarResponses, "oficial");
            DolarApiResponse blue = findDolar(data.dollarResponses, "blue");
            DolarApiResponse tarjeta = findDolar(data.dollarResponses, "tarjeta");

            processCrossGroup(result, official, rates, Map.of(
                    "BRL", CurrencyType.AR_BRL_OFICIAL, "PYG", CurrencyType.AR_PYG_OFICIAL,
                    "BOB", CurrencyType.AR_BOB_OFICIAL, "CNY", CurrencyType.AR_CNY_OFICIAL
            ), " Oficial");

            processCrossGroup(result, blue, rates, Map.of(
                    "BRL", CurrencyType.AR_BRL_BLUE, "PYG", CurrencyType.AR_PYG_BLUE,
                    "BOB", CurrencyType.AR_BOB_BLUE, "CNY", CurrencyType.AR_CNY_BLUE
            ), " Blue");

            processCrossGroup(result, tarjeta, rates, Map.of(
                    "EUR", CurrencyType.AR_EUR_TARJETA, "BRL", CurrencyType.AR_BRL_TARJETA,
                    "PYG", CurrencyType.AR_PYG_TARJETA, "BOB", CurrencyType.AR_BOB_TARJETA,
                    "CNY", CurrencyType.AR_CNY_TARJETA
            ), " Tarjeta");
        });
    }

    private void processCrossGroup(List<QuoteDTO> result, DolarApiResponse baseDollar, Map<String, BigDecimal> rates, Map<String, CurrencyType> typeMap, String suffix) {
        if (baseDollar == null) return;
        typeMap.forEach((code, type) -> addCrossQuote(result, baseDollar, rates, code, type, getCurrencyName(code) + suffix));
    }

    private void addCrossQuote(List<QuoteDTO> result, DolarApiResponse dollarResponse, Map<String, BigDecimal> rates, String currencyCode, CurrencyType type, String name) {
        BigDecimal unitsPerUsd = rates.get(currencyCode);
        if (unitsPerUsd == null || unitsPerUsd.compareTo(BigDecimal.ZERO) <= 0) return;

        BigDecimal usdPerUnit = BigDecimal.ONE.divide(unitsPerUsd, 10, RoundingMode.HALF_UP);
        BigDecimal sell = usdPerUnit.multiply(safeValue(dollarResponse.getVenta(), BigDecimal.ZERO)).setScale(4, RoundingMode.HALF_UP);
        BigDecimal buy = usdPerUnit.multiply(safeValue(dollarResponse.getCompra(), BigDecimal.ZERO)).setScale(4, RoundingMode.HALF_UP);

        result.add(QuoteDTO.builder()
                .type(type).country(Country.ARGENTINA).name(name)
                .buy(buy).sell(sell).spread(sell.subtract(buy))
                .variation(BigDecimal.ZERO)
                .lastUpdate(parseDate(dollarResponse.getFechaActualizacion()))
                .build());
    }

    private QuoteDTO mapToQuoteDTO(DolarApiResponse response) {
        CurrencyType type = CurrencyType.AR_OFFICIAL;
        try { type = CurrencyType.fromCode(response.getCasa(), Country.ARGENTINA); } catch (Exception ignored) {}

        return buildBasicQuote(type, response.getNombre(), response.getCompra(), response.getVenta(), response.getFechaActualizacion());
    }

    private QuoteDTO mapCotizacionToQuoteDTO(CotizacionApiResponse c, CurrencyType type, String name) {
        return buildBasicQuote(type, name, c.getCompra(), c.getVenta(), c.getFechaActualizacion());
    }

    private QuoteDTO buildBasicQuote(CurrencyType type, String name, BigDecimal buyRaw, BigDecimal sellRaw, String dateStr) {
        BigDecimal buy = safeValue(buyRaw, BigDecimal.ZERO);
        BigDecimal sell = safeValue(sellRaw, BigDecimal.ZERO);
        return QuoteDTO.builder()
                .type(type).country(Country.ARGENTINA).name(name)
                .buy(buy).sell(sell).spread(sell.subtract(buy))
                .variation(BigDecimal.ZERO).lastUpdate(parseDate(dateStr)).build();
    }

    private QuoteDTO fetchEuroOficialFromDolarApi() {
        return fetchSingleQuote(CurrencyType.AR_EUR_OFICIAL);
    }

    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null) return LocalDateTime.now();
        try { return ZonedDateTime.parse(dateStr).toLocalDateTime(); } catch (Exception e) { return LocalDateTime.now(); }
    }

    private BigDecimal safeValue(BigDecimal val, BigDecimal defaultVal) { return val != null ? val : defaultVal; }

    private DolarApiResponse findDolar(List<DolarApiResponse> list, String casa) {
        return list == null ? null : list.stream().filter(d -> casa.equalsIgnoreCase(d.getCasa())).findFirst().orElse(null);
    }

    private Optional<CotizacionApiResponse> findCotizacion(List<CotizacionApiResponse> list, String moneda) {
        return list == null ? Optional.empty() : list.stream().filter(c -> moneda.equalsIgnoreCase(c.getMoneda())).findFirst();
    }

    private String getCurrencyName(String code) {
        return switch (code) {
            case "BRL" -> "Real"; case "PYG" -> "Guaraní Paraguayo"; case "BOB" -> "Boliviano"; case "CNY" -> "Yuan"; case "EUR" -> "Euro";
            default -> code;
        };
    }

    private String capitalize(String str) { return str.substring(0, 1).toUpperCase() + str.substring(1); }

    private boolean isDerivedType(CurrencyType type) {
        return Set.of(CurrencyType.AR_CLP_BLUE, CurrencyType.AR_UYU_BLUE, CurrencyType.AR_CLP_TARJETA, CurrencyType.AR_UYU_TARJETA).contains(type);
    }

    private boolean isBlueDerived(CurrencyType type) {
        return type == CurrencyType.AR_CLP_BLUE || type == CurrencyType.AR_UYU_BLUE;
    }

    private boolean isCrossType(CurrencyType type) {
        return type.name().contains("_BRL_") || type.name().contains("_PYG_") || type.name().contains("_BOB_")
                || type.name().contains("_CNY_") || type == CurrencyType.AR_EUR_TARJETA;
    }

    private record MarketDataSnapshot(List<DolarApiResponse> dollarResponses, List<CotizacionApiResponse> cotizaciones) {}

    @Data
    public static class DolarApiResponse {
        private String moneda; private String casa; private String nombre; private BigDecimal compra; private BigDecimal venta;
        @JsonProperty("fechaActualizacion") private String fechaActualizacion;
    }

    @Data
    public static class CotizacionApiResponse {
        private String moneda; private String casa; private String nombre; private BigDecimal compra; private BigDecimal venta;
        @JsonProperty("fechaActualizacion") private String fechaActualizacion;
    }
}
