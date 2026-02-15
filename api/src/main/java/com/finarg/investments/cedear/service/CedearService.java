package com.finarg.investments.cedear.service;

import com.finarg.investments.cedear.dto.CedearDTO;
import com.finarg.investments.stocks.client.DolaritoMervalClient;
import com.finarg.shared.constants.FinancialConstants;
import com.finarg.shared.util.BigDecimalUtils;
import com.finarg.shared.util.DateTimeUtils;
import com.finarg.shared.util.StringUtils;
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
public class CedearService {
    private final DolaritoMervalClient dolaritoMervalClient;

    private static final List<String> POPULAR_CEDEARS = List.of(
            "AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "KO", "DIS", "MELI"
    );

    @Cacheable(value = "cedears", key = "'all'")
    public List<CedearDTO> getAllCedears() {
        log.info("Fetching CEDEAR prices from dolarito.ar");

        DolaritoMervalClient.DolaritoMervalResponse mervalData = dolaritoMervalClient.getMervalData();

        if (mervalData.getCedears() == null || mervalData.getCedears().isEmpty()) {
            log.warn("No CEDEAR data available");
            return List.of();
        }

        return mervalData.getCedears().stream()
                .filter(cedear -> POPULAR_CEDEARS.contains(cedear.getShortName()))
                .sorted(Comparator.comparing(
                        cedear -> POPULAR_CEDEARS.indexOf(cedear.getShortName())
                ))
                .map(this::mapToCedearDTO)
                .toList();
    }

    private CedearDTO mapToCedearDTO(DolaritoMervalClient.CedearItem cedear) {
        BigDecimal lastPrice = cedear.getLastTraded() != null
                ? cedear.getLastTraded()
                : cedear.getPreviousClose();

        BigDecimal changePercent = BigDecimalUtils.orZero(cedear.getVariation());
        BigDecimal change = BigDecimalUtils.percentageChange(cedear.getPreviousClose(), changePercent);

        BigDecimal volume = BigDecimalUtils.fromLong(cedear.getVolume());

        String currency = cedear.getCurrency() != null
                ? cedear.getCurrency().getSymbol()
                : FinancialConstants.DEFAULT_CURRENCY;

        return CedearDTO.builder()
                .symbol(StringUtils.orEmpty(cedear.getShortName()))
                .ticker(StringUtils.orEmpty(cedear.getShortName()))
                .companyName(StringUtils.firstNonBlank(cedear.getName(), cedear.getShortName()))
                .lastPrice(BigDecimalUtils.orZero(lastPrice))
                .change(change)
                .changePercent(changePercent)
                .volume(volume)
                .currency(currency)
                .lastUpdate(DateTimeUtils.now())
                .build();
    }
}
