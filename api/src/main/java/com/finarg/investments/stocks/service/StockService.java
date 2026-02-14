package com.finarg.investments.stocks.service;

import com.finarg.investments.stocks.client.YahooFinanceClient;
import com.finarg.investments.stocks.dto.StockDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockService {
    private final YahooFinanceClient yahooFinanceClient;

    private static final List<String> POPULAR_STOCKS = List.of(
            "AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META", "NVDA", "NFLX"
    );

    @Cacheable(value = "stocks", key = "'popular'")
    public List<StockDTO> getPopularStocks() {
        log.info("Fetching popular stocks");

        List<YahooFinanceClient.StockQuoteResponse> quotes = yahooFinanceClient.getQuotes(POPULAR_STOCKS);

        if (quotes == null || quotes.isEmpty()) {
            log.warn("No stock data available");
            return List.of();
        }

        return quotes.stream()
                .map(this::mapToStockDTO)
                .collect(Collectors.toList());
    }

    private StockDTO mapToStockDTO(YahooFinanceClient.StockQuoteResponse response) {
        String companyName = response.getLongName() != null ? response.getLongName() : response.getShortName();

        LocalDateTime lastUpdate = response.getRegularMarketTime() != null
                ? LocalDateTime.ofInstant(Instant.ofEpochSecond(response.getRegularMarketTime()), ZoneId.systemDefault())
                : LocalDateTime.now();

        BigDecimal volume = response.getRegularMarketVolume() != null
                ? new BigDecimal(response.getRegularMarketVolume())
                : BigDecimal.ZERO;

        BigDecimal marketCap = response.getMarketCap() != null
                ? new BigDecimal(response.getMarketCap())
                : null;

        return StockDTO.builder()
                .ticker(response.getSymbol())
                .companyName(companyName != null ? companyName : response.getSymbol())
                .currentPrice(response.getRegularMarketPrice() != null ? response.getRegularMarketPrice() : BigDecimal.ZERO)
                .change(response.getRegularMarketChange() != null ? response.getRegularMarketChange() : BigDecimal.ZERO)
                .changePercent(response.getRegularMarketChangePercent() != null
                        ? response.getRegularMarketChangePercent()
                        : BigDecimal.ZERO)
                .volume(volume)
                .marketCap(marketCap)
                .currency(response.getCurrency() != null ? response.getCurrency() : "USD")
                .lastUpdate(lastUpdate)
                .build();
    }
}
