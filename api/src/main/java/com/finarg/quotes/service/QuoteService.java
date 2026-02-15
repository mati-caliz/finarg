package com.finarg.quotes.service;

import com.finarg.quotes.client.argentina.ArgentinaDatosClient;
import com.finarg.quotes.client.factory.QuoteClient;
import com.finarg.quotes.client.factory.QuoteClientFactory;
import com.finarg.quotes.dto.GapDTO;
import com.finarg.quotes.dto.QuoteDTO;
import com.finarg.quotes.entity.QuoteHistory;
import com.finarg.shared.enums.Country;
import com.finarg.shared.enums.CurrencyType;
import com.finarg.shared.constants.UiColors;
import com.finarg.shared.enums.GapLevel;
import com.finarg.shared.util.BigDecimalUtils;
import com.finarg.quotes.repository.QuoteHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuoteService {

    private static final int DISPLAY_ORDER_OFFICIAL = 0;
    private static final int DISPLAY_ORDER_BLUE = 1;
    private static final int DISPLAY_ORDER_CARD = 2;
    private static final int DISPLAY_ORDER_OTHER = 3;
    private static final int DISPLAY_ORDER_DEFAULT = 99;

    private final QuoteClientFactory quoteClientFactory;
    private final QuoteHistoryRepository quoteHistoryRepository;
    private final ArgentinaDatosClient argentinaDatosClient;

    @Cacheable(value = "quotes", key = "'all_' + #country.code")
    public List<QuoteDTO> getAllQuotes(Country country) {
        log.info("Fetching all quotes for country: {}", country);
        QuoteClient client = quoteClientFactory.getClient(country);
        List<QuoteDTO> quotes = client.getAllQuotes();
        List<QuoteDTO> enriched = new ArrayList<>(enrichQuotesWithVariation(quotes));
        enriched.forEach(q -> q.setDisplayOrder(calculateDisplayOrder(q.getType())));
        enriched.sort(Comparator.comparingInt(q -> q.getDisplayOrder() != null ? q.getDisplayOrder() : DISPLAY_ORDER_DEFAULT));
        return enriched;
    }

    @Cacheable(value = "quotes", key = "#country.code + '_' + #type.code")
    public QuoteDTO getQuote(Country country, CurrencyType type) {
        log.info("Fetching quote for country: {}, type: {}", country, type);
        QuoteClient client = quoteClientFactory.getClient(country);
        QuoteDTO quote = client.getQuote(type);
        if (quote != null) {
            BigDecimal variation = fetchAndCalculateVariation(quote.getType(), quote.getSell());
            enrichQuoteMetadata(quote, variation);
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
                    .trafficLightColor(UiColors.GREEN)
                    .description("No data available")
                    .build();
        }

        BigDecimal officialSell = official.getSell();
        BigDecimal parallelSell = parallel.getSell();

        BigDecimal gap = BigDecimalUtils.variationPercentage(parallelSell, officialSell);

        GapLevel level = GapLevel.fromPercentage(gap.doubleValue());

        return GapDTO.builder()
                .country(country)
                .officialRate(officialSell)
                .parallelRate(parallelSell)
                .gapPercentage(gap.setScale(2, java.math.RoundingMode.HALF_UP))
                .level(level)
                .trafficLightColor(level.getColor())
                .description(level.getDescription())
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

    private void enrichQuoteMetadata(QuoteDTO quote, BigDecimal variation) {
        quote.setVariation(variation);
        quote.setBaseCurrency(quote.getType().getBaseCurrency());
        quote.setHasHistory(quote.getType().isHasHistory());
    }

    private List<QuoteDTO> enrichQuotesWithVariation(List<QuoteDTO> quotes) {
        if (quotes.isEmpty()) {
            return quotes;
        }

        LocalDate today = LocalDate.now();
        List<CurrencyType> types = quotes.stream()
                .map(QuoteDTO::getType)
                .distinct()
                .toList();

        Map<CurrencyType, QuoteHistory> previousByType = quoteHistoryRepository
                .findLatestByTypesBeforeDate(types, today)
                .stream()
                .collect(Collectors.toMap(
                        QuoteHistory::getType,
                        q -> q,
                        (a, b) -> a.getId() > b.getId() ? a : b
                ));

        return quotes.stream()
                .peek(quote -> {
                    BigDecimal prevSell = previousByType.containsKey(quote.getType())
                            ? previousByType.get(quote.getType()).getSell()
                            : null;
                    BigDecimal variation = BigDecimalUtils.variationPercentage(quote.getSell(), prevSell);
                    enrichQuoteMetadata(quote, variation);
                })
                .toList();
    }

    private BigDecimal fetchAndCalculateVariation(CurrencyType type, BigDecimal currentSell) {
        if (currentSell == null || currentSell.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        LocalDate today = LocalDate.now();
        return quoteHistoryRepository.findLatestByTypeBeforeDate(type, today)
                .map(prev -> BigDecimalUtils.variationPercentage(currentSell, prev.getSell()))
                .orElse(BigDecimal.ZERO);
    }

    private static int calculateDisplayOrder(CurrencyType type) {
        if (type == null) {
            return DISPLAY_ORDER_DEFAULT;
        }
        String code = type.getCode();
        if (code.equals("oficial") || code.endsWith("_oficial")) {
            return DISPLAY_ORDER_OFFICIAL;
        }
        if (code.equals("blue") || code.endsWith("_blue")) {
            return DISPLAY_ORDER_BLUE;
        }
        if (code.equals("tarjeta") || code.endsWith("_tarjeta")) {
            return DISPLAY_ORDER_CARD;
        }
        return DISPLAY_ORDER_OTHER;
    }
}
