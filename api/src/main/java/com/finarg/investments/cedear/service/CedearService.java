package com.finarg.investments.cedear.service;

import com.finarg.investments.cedear.client.CedearClient;
import com.finarg.investments.cedear.dto.CedearDTO;
import com.finarg.investments.stocks.client.YahooFinanceClient;
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
public class CedearService {
    private final CedearClient cedearClient;

    private static final List<String> POPULAR_CEDEARS = List.of(
            "AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "KO", "DIS", "MELI"
    );

    @Cacheable(value = "cedears", key = "'all'")
    public List<CedearDTO> getAllCedears() {
        log.info("Fetching CEDEAR prices");

        List<YahooFinanceClient.StockQuoteResponse> quotes = cedearClient.getCedearQuotes(POPULAR_CEDEARS);

        if (quotes == null || quotes.isEmpty()) {
            log.warn("No CEDEAR data available");
            return List.of();
        }

        return quotes.stream()
                .map(this::mapToCedearDTO)
                .collect(Collectors.toList());
    }

    private CedearDTO mapToCedearDTO(YahooFinanceClient.StockQuoteResponse response) {
        String ticker = response.getSymbol();
        String symbol = ticker != null && ticker.endsWith(".BA")
                ? ticker.substring(0, ticker.length() - 3)
                : ticker;

        String companyName = response.getLongName() != null
                ? response.getLongName()
                : response.getShortName();

        LocalDateTime lastUpdate = response.getRegularMarketTime() != null
                ? LocalDateTime.ofInstant(Instant.ofEpochSecond(response.getRegularMarketTime()), ZoneId.systemDefault())
                : LocalDateTime.now();

        BigDecimal volume = response.getRegularMarketVolume() != null
                ? new BigDecimal(response.getRegularMarketVolume())
                : BigDecimal.ZERO;

        return CedearDTO.builder()
                .symbol(symbol != null ? symbol : "")
                .ticker(ticker != null ? ticker : "")
                .companyName(companyName != null ? companyName : symbol)
                .lastPrice(response.getRegularMarketPrice() != null ? response.getRegularMarketPrice() : BigDecimal.ZERO)
                .change(response.getRegularMarketChange() != null ? response.getRegularMarketChange() : BigDecimal.ZERO)
                .changePercent(response.getRegularMarketChangePercent() != null
                        ? response.getRegularMarketChangePercent()
                        : BigDecimal.ZERO)
                .volume(volume)
                .currency("ARS")
                .lastUpdate(lastUpdate)
                .build();
    }
}
