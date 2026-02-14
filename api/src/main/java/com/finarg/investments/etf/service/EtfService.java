package com.finarg.investments.etf.service;

import com.finarg.investments.etf.dto.EtfDTO;
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
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EtfService {
    private final YahooFinanceClient yahooFinanceClient;

    private static final List<String> POPULAR_ETFS = List.of(
            "SPY", "QQQ", "VOO", "VTI", "IWM", "EEM", "GLD", "TLT"
    );

    @Cacheable(value = "etf", key = "'popular'")
    public List<EtfDTO> getPopularEtfs() {
        log.info("Fetching popular ETF prices");

        List<YahooFinanceClient.StockQuoteResponse> quotes = yahooFinanceClient.getQuotes(POPULAR_ETFS);

        if (quotes == null || quotes.isEmpty()) {
            log.warn("No ETF data available");
            return List.of();
        }

        return quotes.stream()
                .filter(Objects::nonNull)
                .map(this::mapToEtfDTO)
                .collect(Collectors.toList());
    }

    private EtfDTO mapToEtfDTO(YahooFinanceClient.StockQuoteResponse response) {
        String name = response.getLongName() != null
                ? response.getLongName()
                : response.getShortName();

        LocalDateTime lastUpdate = response.getRegularMarketTime() != null
                ? LocalDateTime.ofInstant(Instant.ofEpochSecond(response.getRegularMarketTime()), ZoneId.systemDefault())
                : LocalDateTime.now();

        BigDecimal volume = response.getRegularMarketVolume() != null
                ? new BigDecimal(response.getRegularMarketVolume())
                : BigDecimal.ZERO;

        BigDecimal aum = response.getMarketCap() != null
                ? new BigDecimal(response.getMarketCap())
                : null;

        return EtfDTO.builder()
                .ticker(response.getSymbol() != null ? response.getSymbol() : "")
                .name(name != null ? name : response.getSymbol())
                .price(response.getRegularMarketPrice() != null ? response.getRegularMarketPrice() : BigDecimal.ZERO)
                .change(response.getRegularMarketChange() != null ? response.getRegularMarketChange() : BigDecimal.ZERO)
                .changePercent(response.getRegularMarketChangePercent() != null
                        ? response.getRegularMarketChangePercent()
                        : BigDecimal.ZERO)
                .volume(volume)
                .aum(aum)
                .expenseRatio(null)
                .currency(response.getCurrency() != null ? response.getCurrency() : "USD")
                .lastUpdate(lastUpdate)
                .build();
    }
}
