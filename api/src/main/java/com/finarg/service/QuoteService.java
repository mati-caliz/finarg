package com.finarg.service;

import com.finarg.client.ArgentinaDatosClient;
import com.finarg.client.QuoteClient;
import com.finarg.client.QuoteClientFactory;
import com.finarg.model.dto.GapDTO;
import com.finarg.model.dto.QuoteDTO;
import com.finarg.model.entity.QuoteHistory;
import com.finarg.model.enums.Country;
import com.finarg.model.enums.CurrencyType;
import com.finarg.model.enums.GapLevel;
import com.finarg.repository.QuoteHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuoteService {

    private final QuoteClientFactory quoteClientFactory;
    private final QuoteHistoryRepository quoteHistoryRepository;
    private final ArgentinaDatosClient argentinaDatosClient;

    @Cacheable(value = "quotes", key = "'all_' + #country.code")
    public List<QuoteDTO> getAllQuotes(Country country) {
        log.info("Fetching all quotes for country: {}", country);
        QuoteClient client = quoteClientFactory.getClient(country);
        List<QuoteDTO> quotes = client.getAllQuotes();
        return enrichQuotesWithVariation(quotes);
    }

    @Cacheable(value = "quotes", key = "#country.code + '_' + #type.code")
    public QuoteDTO getQuote(Country country, CurrencyType type) {
        log.info("Fetching quote for country: {}, type: {}", country, type);
        QuoteClient client = quoteClientFactory.getClient(country);
        QuoteDTO quote = client.getQuote(type);
        if (quote != null) {
            BigDecimal variation = calculateVariation(quote.getType(), quote.getSell());
            quote.setVariation(variation);
        }
        return quote;
    }

    @Cacheable(value = "quotes", key = "'gap_' + #country.code")
    public GapDTO calculateGap(Country country) {
        QuoteClient client = quoteClientFactory.getClient(country);
        List<QuoteDTO> quotes = client.getAllQuotes();
        
        CurrencyType officialType = getOfficialType(country);
        CurrencyType parallelType = getParallelType(country);
        
        QuoteDTO official = quotes.stream()
                .filter(q -> q.getType() == officialType)
                .findFirst()
                .orElse(null);
                
        QuoteDTO parallel = quotes.stream()
                .filter(q -> q.getType() == parallelType)
                .findFirst()
                .orElse(null);

        if (official == null || parallel == null) {
            return GapDTO.builder()
                    .country(country)
                    .gapPercentage(BigDecimal.ZERO)
                    .level(GapLevel.LOW)
                    .trafficLightColor("#22c55e")
                    .description("No data available")
                    .build();
        }

        BigDecimal officialSell = official.getSell();
        BigDecimal parallelSell = parallel.getSell();

        BigDecimal gap = parallelSell.subtract(officialSell)
                .divide(officialSell, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        GapLevel level = GapLevel.fromPercentage(gap.doubleValue());
        String color = switch (level) {
            case LOW -> "#22c55e";
            case MEDIUM -> "#eab308";
            case HIGH -> "#ef4444";
        };

        String description = switch (level) {
            case LOW -> "Low gap - Stable market";
            case MEDIUM -> "Moderate gap - Attention";
            case HIGH -> "High gap - Exchange tension";
        };

        return GapDTO.builder()
                .country(country)
                .officialRate(officialSell)
                .parallelRate(parallelSell)
                .gapPercentage(gap.setScale(2, RoundingMode.HALF_UP))
                .level(level)
                .trafficLightColor(color)
                .description(description)
                .build();
    }

    private CurrencyType getOfficialType(Country country) {
        return switch (country) {
            case ARGENTINA -> CurrencyType.AR_OFFICIAL;
            case COLOMBIA -> CurrencyType.CO_TRM;
            case BRAZIL -> CurrencyType.BR_PTAX;
            case CHILE -> CurrencyType.CL_OBSERVED;
            case URUGUAY -> CurrencyType.UY_INTERBANK;
        };
    }

    private CurrencyType getParallelType(Country country) {
        return switch (country) {
            case ARGENTINA -> CurrencyType.AR_BLUE;
            case COLOMBIA -> CurrencyType.CO_EXCHANGE_HOUSES;
            case BRAZIL -> CurrencyType.BR_PARALLEL;
            case CHILE -> CurrencyType.CL_INFORMAL;
            case URUGUAY -> CurrencyType.UY_BILL;
        };
    }

    @Cacheable(value = "history", key = "#type.name() + '_' + #from + '_' + #to")
    public List<QuoteHistory> getHistory(CurrencyType type, LocalDate from, LocalDate to) {
        if (type.getCountry() == Country.ARGENTINA) {
            if (type == CurrencyType.AR_EUR_OFICIAL || type == CurrencyType.AR_BRL_OFICIAL
                    || type == CurrencyType.AR_CLP_OFICIAL || type == CurrencyType.AR_UYU_OFICIAL
                    || type == CurrencyType.AR_CNY_OFICIAL || type == CurrencyType.AR_PYG_OFICIAL
                    || type == CurrencyType.AR_BOB_OFICIAL) {
                List<QuoteHistory> external = argentinaDatosClient.getCurrencyHistory(type.getCode(), from, to);
                if (!external.isEmpty()) {
                    return external;
                }
            } else if (isArgentinaDollarExchange(type)) {
                List<QuoteHistory> external = argentinaDatosClient.getDollarHistory(type.getCode(), from, to);
                if (!external.isEmpty()) {
                    return external;
                }
            }
        }
        return quoteHistoryRepository.findByTypeAndDateBetweenOrderByDateAsc(type, from, to);
    }

    private static boolean isArgentinaDollarExchange(CurrencyType type) {
        return type == CurrencyType.AR_OFFICIAL || type == CurrencyType.AR_BLUE
                || type == CurrencyType.AR_MEP || type == CurrencyType.AR_CCL
                || type == CurrencyType.AR_WHOLESALE || type == CurrencyType.AR_CARD
                || type == CurrencyType.AR_CRYPTO;
    }

    @CacheEvict(value = "quotes", allEntries = true)
    public void refreshCache() {
        log.info("Quotes cache cleared");
    }

    private List<QuoteDTO> enrichQuotesWithVariation(List<QuoteDTO> quotes) {
        LocalDate today = LocalDate.now();
        List<CurrencyType> types = quotes.stream()
                .map(QuoteDTO::getType)
                .collect(Collectors.toList());

        Map<CurrencyType, QuoteHistory> previousByType = quoteHistoryRepository
                .findLatestByTypesBeforeDate(types, today)
                .stream()
                .collect(Collectors.toMap(QuoteHistory::getType, q -> q, (a, b) -> a));

        return quotes.stream()
                .peek(quote -> {
                    BigDecimal variation = computeVariation(quote.getSell(), previousByType.get(quote.getType()));
                    quote.setVariation(variation);
                })
                .collect(Collectors.toList());
    }

    private BigDecimal computeVariation(BigDecimal currentSell, QuoteHistory previous) {
        if (currentSell == null || currentSell.compareTo(BigDecimal.ZERO) == 0 || previous == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal previousSell = previous.getSell();
        if (previousSell.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal difference = currentSell.subtract(previousSell);
        BigDecimal variation = difference.divide(previousSell, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return variation.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateVariation(CurrencyType type, BigDecimal currentSell) {
        if (currentSell == null || currentSell.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        LocalDate today = LocalDate.now();
        return quoteHistoryRepository.findLatestByTypeBeforeDate(type, today)
                .map(prev -> computeVariation(currentSell, prev))
                .orElse(BigDecimal.ZERO);
    }
}
