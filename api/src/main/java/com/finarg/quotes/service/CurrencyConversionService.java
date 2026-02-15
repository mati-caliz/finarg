package com.finarg.quotes.service;

import com.finarg.quotes.dto.CurrencyConversionRequestDTO;
import com.finarg.quotes.dto.CurrencyConversionResponseDTO;
import com.finarg.quotes.dto.QuoteDTO;
import com.finarg.shared.enums.Country;
import com.finarg.shared.enums.CurrencyType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CurrencyConversionService {

    private final QuoteService quoteService;
    private static final int SCALE = 6;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
    private static final BigDecimal COMMISSION_PERCENTAGE = BigDecimal.valueOf(0.02);

    @Cacheable(value = "currencyConversion",
            key = "#request.fromCountry + '_' + #request.fromCurrency + '_' + "
                    + "#request.toCountry + '_' + #request.toCurrency")
    public CurrencyConversionResponseDTO convert(CurrencyConversionRequestDTO request) {
        log.info("Converting {} {} from {}/{} to {}/{}",
                request.getAmount(), request.getFromCurrency(),
                request.getFromCountry(), request.getFromPriceType(),
                request.getToCurrency(), request.getToPriceType());

        Country fromCountry = Country.fromCode(request.getFromCountry());
        Country toCountry = Country.fromCode(request.getToCountry());

        boolean isFromLocalCurrency = isLocalCurrency(request.getFromCurrency());
        boolean isToLocalCurrency = isLocalCurrency(request.getToCurrency());

        QuoteDTO fromQuote;
        QuoteDTO toQuote;

        if (isFromLocalCurrency) {
            fromQuote = createLocalCurrencyQuote(request.getFromCurrency(), fromCountry);
            CurrencyType toType = findCurrencyType(request.getToCurrency(), toCountry);
            toQuote = quoteService.getQuote(toCountry, toType);
        } else if (isToLocalCurrency) {
            CurrencyType fromType = findCurrencyType(request.getFromCurrency(), fromCountry);
            fromQuote = quoteService.getQuote(fromCountry, fromType);
            toQuote = createLocalCurrencyQuote(request.getToCurrency(), toCountry);
        } else {
            CurrencyType fromType = findCurrencyType(request.getFromCurrency(), fromCountry);
            CurrencyType toType = findCurrencyType(request.getToCurrency(), toCountry);
            fromQuote = quoteService.getQuote(fromCountry, fromType);
            toQuote = quoteService.getQuote(toCountry, toType);
        }

        if (fromQuote == null || toQuote == null) {
            throw new IllegalArgumentException("Unable to fetch quotes for conversion");
        }

        boolean isSameCountry = fromCountry.equals(toCountry);
        CurrencyConversionResponseDTO.ConversionRate conversionRate;
        BigDecimal convertedAmount;

        if (isSameCountry) {
            conversionRate = calculateDirectConversion(fromQuote, toQuote, request);
            convertedAmount = request.getAmount().multiply(conversionRate.getRate()).setScale(2, ROUNDING_MODE);
        } else {
            conversionRate = calculateCrossCountryConversion(fromQuote, toQuote, request);
            convertedAmount = request.getAmount().multiply(conversionRate.getRate()).setScale(2, ROUNDING_MODE);
        }

        CurrencyConversionResponseDTO.ConversionMetadata metadata = calculateMetadata(
                fromQuote, toQuote, conversionRate.getRate(), isSameCountry);

        return CurrencyConversionResponseDTO.builder()
                .fromAmount(request.getAmount())
                .toAmount(convertedAmount)
                .fromCurrency(request.getFromCurrency())
                .toCurrency(request.getToCurrency())
                .fromCountry(request.getFromCountry())
                .toCountry(request.getToCountry())
                .conversionRate(conversionRate)
                .metadata(metadata)
                .timestamp(LocalDateTime.now())
                .build();
    }

    private CurrencyConversionResponseDTO.ConversionRate calculateDirectConversion(
            QuoteDTO fromQuote,
            QuoteDTO toQuote,
            CurrencyConversionRequestDTO request) {

        BigDecimal fromPrice = getPriceByType(fromQuote, request.getFromPriceType());
        BigDecimal toPrice = getPriceByType(toQuote, request.getToPriceType());

        BigDecimal rate;

        boolean isFromLocal = fromQuote.getType() == null;
        boolean isToLocal = toQuote.getType() == null;

        if (isFromLocal && !isToLocal) {
            rate = BigDecimal.ONE.divide(toPrice, SCALE, ROUNDING_MODE);
        } else if (!isFromLocal && isToLocal) {
            rate = fromPrice;
        } else {
            rate = toPrice.divide(fromPrice, SCALE, ROUNDING_MODE);
        }

        return CurrencyConversionResponseDTO.ConversionRate.builder()
                .rate(rate)
                .fromPriceType(request.getFromPriceType().name())
                .toPriceType(request.getToPriceType().name())
                .fromQuotePrice(fromPrice)
                .toQuotePrice(toPrice)
                .isDirectConversion(true)
                .intermediaryCurrency(null)
                .build();
    }

    private CurrencyConversionResponseDTO.ConversionRate calculateCrossCountryConversion(
            QuoteDTO fromQuote,
            QuoteDTO toQuote,
            CurrencyConversionRequestDTO request) {

        BigDecimal fromPrice = getPriceByType(fromQuote, request.getFromPriceType());
        BigDecimal toPrice = getPriceByType(toQuote, request.getToPriceType());

        BigDecimal usdFromFromCurrency = BigDecimal.ONE.divide(fromPrice, SCALE, ROUNDING_MODE);
        BigDecimal rate = usdFromFromCurrency.multiply(toPrice);

        return CurrencyConversionResponseDTO.ConversionRate.builder()
                .rate(rate)
                .fromPriceType(request.getFromPriceType().name())
                .toPriceType(request.getToPriceType().name())
                .fromQuotePrice(fromPrice)
                .toQuotePrice(toPrice)
                .isDirectConversion(false)
                .intermediaryCurrency("USD")
                .build();
    }

    private CurrencyConversionResponseDTO.ConversionMetadata calculateMetadata(
            QuoteDTO fromQuote,
            QuoteDTO toQuote,
            BigDecimal conversionRate,
            boolean isSameCountry) {

        BigDecimal fromSpread = fromQuote.getSell().subtract(fromQuote.getBuy());
        BigDecimal toSpread = toQuote.getSell().subtract(toQuote.getBuy());

        BigDecimal fromSpreadPercentage = fromSpread
                .divide(fromQuote.getBuy(), 4, ROUNDING_MODE)
                .multiply(BigDecimal.valueOf(100));

        BigDecimal toSpreadPercentage = toSpread
                .divide(toQuote.getBuy(), 4, ROUNDING_MODE)
                .multiply(BigDecimal.valueOf(100));

        BigDecimal totalSpreadPercentage;
        BigDecimal estimatedCommission;

        if (isSameCountry) {
            totalSpreadPercentage = fromSpreadPercentage.add(toSpreadPercentage);
            estimatedCommission = COMMISSION_PERCENTAGE;
        } else {
            totalSpreadPercentage = fromSpreadPercentage
                    .add(toSpreadPercentage)
                    .add(BigDecimal.ONE);
            estimatedCommission = COMMISSION_PERCENTAGE.multiply(BigDecimal.valueOf(1.5));
        }

        BigDecimal effectiveRate = conversionRate.multiply(
                BigDecimal.ONE.subtract(estimatedCommission)
        );

        return CurrencyConversionResponseDTO.ConversionMetadata.builder()
                .fromSpread(fromSpread)
                .toSpread(toSpread)
                .fromSpreadPercentage(fromSpreadPercentage)
                .toSpreadPercentage(toSpreadPercentage)
                .totalSpreadPercentage(totalSpreadPercentage)
                .estimatedCommission(estimatedCommission.multiply(BigDecimal.valueOf(100)))
                .effectiveRate(effectiveRate)
                .build();
    }

    private BigDecimal getPriceByType(QuoteDTO quote, CurrencyConversionRequestDTO.PriceType priceType) {
        return priceType == CurrencyConversionRequestDTO.PriceType.BUY
                ? quote.getBuy()
                : quote.getSell();
    }

    private CurrencyType findCurrencyType(String currencyCode, Country country) {
        List<QuoteDTO> quotes = quoteService.getAllQuotes(country);
        return quotes.stream()
                .filter(q -> q.getType().getCode().equalsIgnoreCase(currencyCode))
                .findFirst()
                .map(QuoteDTO::getType)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Currency type not found: " + currencyCode + " for country: " + country));
    }

    private boolean isLocalCurrency(String currencyCode) {
        return currencyCode.equalsIgnoreCase("ars")
                || currencyCode.equalsIgnoreCase("brl")
                || currencyCode.equalsIgnoreCase("clp")
                || currencyCode.equalsIgnoreCase("cop")
                || currencyCode.equalsIgnoreCase("uyu");
    }

    private QuoteDTO createLocalCurrencyQuote(String currencyCode, Country country) {
        String currencyName = switch (currencyCode.toLowerCase()) {
            case "ars" -> "Peso Argentino";
            case "brl" -> "Real Brasileño";
            case "clp" -> "Peso Chileno";
            case "cop" -> "Peso Colombiano";
            case "uyu" -> "Peso Uruguayo";
            default -> throw new IllegalArgumentException("Unknown local currency: " + currencyCode);
        };

        return QuoteDTO.builder()
                .type(null)
                .country(country)
                .name(currencyName)
                .buy(BigDecimal.ONE)
                .sell(BigDecimal.ONE)
                .spread(BigDecimal.ZERO)
                .variation(BigDecimal.ZERO)
                .lastUpdate(LocalDateTime.now())
                .baseCurrency(currencyCode.toUpperCase())
                .hasHistory(false)
                .build();
    }
}
