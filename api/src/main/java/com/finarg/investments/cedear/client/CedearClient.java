package com.finarg.investments.cedear.client;

import com.finarg.investments.stocks.client.YahooFinanceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class CedearClient {
    private final YahooFinanceClient yahooFinanceClient;

    public List<YahooFinanceClient.StockQuoteResponse> getCedearQuotes(List<String> cedearSymbols) {
        List<String> symbolsWithBA = cedearSymbols.stream()
                .map(symbol -> symbol + ".BA")
                .collect(Collectors.toList());

        log.debug("Fetching CEDEAR quotes for: {}", String.join(",", symbolsWithBA));

        return yahooFinanceClient.getQuotes(symbolsWithBA);
    }
}
