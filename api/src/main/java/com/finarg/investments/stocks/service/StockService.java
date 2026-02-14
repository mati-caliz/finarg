package com.finarg.investments.stocks.service;

import com.finarg.investments.stocks.client.DolaritoMervalClient;
import com.finarg.investments.stocks.dto.StockDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockService {
    private final DolaritoMervalClient dolaritoMervalClient;

    private static final List<String> POPULAR_STOCKS = List.of(
            "GGAL", "YPF", "BMA", "PAMP", "BBAR", "ALUA", "LOMA", "TRAN"
    );

    @Cacheable(value = "stocks", key = "'popular'")
    public List<StockDTO> getPopularStocks() {
        log.info("Fetching popular stocks from dolarito.ar");

        DolaritoMervalClient.DolaritoMervalResponse mervalData = dolaritoMervalClient.getMervalData();

        if (mervalData.getLeadEquity() == null || mervalData.getLeadEquity().isEmpty()) {
            log.warn("No stock data available");
            return List.of();
        }

        return mervalData.getLeadEquity().stream()
                .filter(stock -> POPULAR_STOCKS.contains(stock.getTicker()))
                .sorted(Comparator.comparing(
                        stock -> POPULAR_STOCKS.indexOf(stock.getTicker())
                ))
                .map(this::mapToStockDTO)
                .collect(Collectors.toList());
    }

    private StockDTO mapToStockDTO(DolaritoMervalClient.StockItem stock) {
        LocalDateTime lastUpdate = stock.getTimestampCotizacion() != null
                ? LocalDateTime.ofInstant(Instant.ofEpochMilli(stock.getTimestampCotizacion()), ZoneId.systemDefault())
                : LocalDateTime.now();

        BigDecimal volume = stock.getVolumen() != null
                ? new BigDecimal(stock.getVolumen())
                : BigDecimal.ZERO;

        BigDecimal currentPrice = stock.getUltOperado() != null
                ? stock.getUltOperado()
                : stock.getCierreAnterior();

        BigDecimal changePercent = stock.getVariacion() != null
                ? stock.getVariacion()
                : BigDecimal.ZERO;

        BigDecimal change = BigDecimal.ZERO;
        if (stock.getCierreAnterior() != null && changePercent != null) {
            change = stock.getCierreAnterior()
                    .multiply(changePercent)
                    .divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
        }

        String currency = stock.getMoneda() != null
                ? stock.getMoneda().getSimbolo()
                : "ARS";

        return StockDTO.builder()
                .ticker(stock.getTicker() != null ? stock.getTicker() : "")
                .companyName(stock.getNombre() != null ? stock.getNombre() : stock.getTicker())
                .currentPrice(currentPrice != null ? currentPrice : BigDecimal.ZERO)
                .change(change)
                .changePercent(changePercent != null ? changePercent : BigDecimal.ZERO)
                .volume(volume)
                .marketCap(null)
                .currency(currency)
                .lastUpdate(lastUpdate)
                .build();
    }
}
