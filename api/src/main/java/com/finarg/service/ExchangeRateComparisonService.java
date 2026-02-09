package com.finarg.service;

import com.finarg.model.dto.ExchangeRateComparisonDTO;
import com.finarg.model.dto.QuoteDTO;
import com.finarg.model.enums.Country;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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
                .collect(Collectors.toList());

        ExchangeRateComparisonDTO.ExchangeRateItemDTO cheapestToBuy = rateItems.stream()
                .min(Comparator.comparing(ExchangeRateComparisonDTO.ExchangeRateItemDTO::getBuy))
                .orElse(null);

        ExchangeRateComparisonDTO.ExchangeRateItemDTO cheapestToSell = rateItems.stream()
                .min(Comparator.comparing(ExchangeRateComparisonDTO.ExchangeRateItemDTO::getSell))
                .orElse(null);

        ExchangeRateComparisonDTO.ExchangeRateItemDTO mostExpensiveToBuy = rateItems.stream()
                .max(Comparator.comparing(ExchangeRateComparisonDTO.ExchangeRateItemDTO::getBuy))
                .orElse(null);

        ExchangeRateComparisonDTO.ExchangeRateItemDTO mostExpensiveToSell = rateItems.stream()
                .max(Comparator.comparing(ExchangeRateComparisonDTO.ExchangeRateItemDTO::getSell))
                .orElse(null);

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
