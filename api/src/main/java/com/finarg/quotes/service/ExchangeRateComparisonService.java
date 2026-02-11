package com.finarg.quotes.service;

import com.finarg.quotes.dto.ExchangeRateComparisonDTO;
import com.finarg.quotes.dto.QuoteDTO;
import com.finarg.shared.enums.Country;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeRateComparisonService {

    private final QuoteService quoteService;

    @Cacheable(value = "exchangeRateComparison", key = "#country.code")
    public ExchangeRateComparisonDTO compareRates(Country country) {
        log.info("Comparing exchange rates for country: {}", country);

        List<QuoteDTO> quotes = quoteService.getAllQuotes(country);

        List<ExchangeRateComparisonDTO.ExchangeRateItemDTO> rateItems = quotes.stream()
                .filter(quote -> quote.getBuy() != null && quote.getSell() != null)
                .filter(quote -> quote.getBuy().compareTo(BigDecimal.ZERO) > 0)
                .filter(quote -> quote.getSell().compareTo(BigDecimal.ZERO) > 0)
                .map(this::convertToRateItem)
                .toList();

        ExchangeRateComparisonDTO.ExchangeRateItemDTO cheapestToBuy = null;
        ExchangeRateComparisonDTO.ExchangeRateItemDTO cheapestToSell = null;
        ExchangeRateComparisonDTO.ExchangeRateItemDTO mostExpensiveToBuy = null;
        ExchangeRateComparisonDTO.ExchangeRateItemDTO mostExpensiveToSell = null;

        for (ExchangeRateComparisonDTO.ExchangeRateItemDTO item : rateItems) {
            if (cheapestToBuy == null || item.getBuy().compareTo(cheapestToBuy.getBuy()) < 0) {
                cheapestToBuy = item;
            }
            if (cheapestToSell == null || item.getSell().compareTo(cheapestToSell.getSell()) < 0) {
                cheapestToSell = item;
            }
            if (mostExpensiveToBuy == null || item.getBuy().compareTo(mostExpensiveToBuy.getBuy()) > 0) {
                mostExpensiveToBuy = item;
            }
            if (mostExpensiveToSell == null || item.getSell().compareTo(mostExpensiveToSell.getSell()) > 0) {
                mostExpensiveToSell = item;
            }
        }

        return ExchangeRateComparisonDTO.builder()
                .country(country)
                .rates(rateItems)
                .cheapestToBuy(cheapestToBuy)
                .cheapestToSell(cheapestToSell)
                .mostExpensiveToBuy(mostExpensiveToBuy)
                .mostExpensiveToSell(mostExpensiveToSell)
                .build();
    }

    private ExchangeRateComparisonDTO.ExchangeRateItemDTO convertToRateItem(QuoteDTO quote) {
        BigDecimal spread = quote.getSell().subtract(quote.getBuy());
        BigDecimal spreadPercentage = spread
                .divide(quote.getBuy(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return ExchangeRateComparisonDTO.ExchangeRateItemDTO.builder()
                .type(quote.getType().getCode())
                .name(quote.getType().getName())
                .baseCurrency(quote.getType().getBaseCurrency())
                .buy(quote.getBuy())
                .sell(quote.getSell())
                .spread(spread)
                .spreadPercentage(spreadPercentage)
                .variation(quote.getVariation())
                .build();
    }
}
