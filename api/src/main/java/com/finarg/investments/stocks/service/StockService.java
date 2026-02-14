package com.finarg.investments.stocks.service;

import com.finarg.investments.stocks.client.DolaritoMervalClient;
import com.finarg.investments.stocks.dto.StockDTO;
import com.finarg.shared.constants.FinancialConstants;
import com.finarg.shared.util.BigDecimalUtils;
import com.finarg.shared.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

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
                .toList();
    }

    private StockDTO mapToStockDTO(DolaritoMervalClient.StockItem stock) {
        BigDecimal currentPrice = stock.getUltOperado() != null
                ? stock.getUltOperado()
                : stock.getCierreAnterior();

        BigDecimal changePercent = BigDecimalUtils.orZero(stock.getVariacion());
        BigDecimal change = BigDecimalUtils.percentageChange(stock.getCierreAnterior(), changePercent);

        BigDecimal volume = stock.getVolumen() != null
                ? new BigDecimal(stock.getVolumen())
                : BigDecimal.ZERO;

        String currency = stock.getMoneda() != null
                ? stock.getMoneda().getSimbolo()
                : FinancialConstants.DEFAULT_CURRENCY;

        return StockDTO.builder()
                .ticker(stock.getTicker() != null ? stock.getTicker() : "")
                .companyName(stock.getNombre() != null ? stock.getNombre() : stock.getTicker())
                .currentPrice(BigDecimalUtils.orZero(currentPrice))
                .change(change)
                .changePercent(changePercent)
                .volume(volume)
                .marketCap(null)
                .currency(currency)
                .lastUpdate(DateTimeUtils.fromEpochMillis(stock.getTimestampCotizacion()))
                .build();
    }
}
