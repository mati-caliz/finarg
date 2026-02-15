package com.finarg.investments.letras.service;

import com.finarg.investments.letras.dto.LetraDTO;
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
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LetraService {
    private final DolaritoMervalClient dolaritoMervalClient;

    @Cacheable(value = "letras", key = "'all'")
    public List<LetraDTO> getAllLetras() {
        log.info("Fetching letras from dolarito.ar");

        DolaritoMervalClient.DolaritoMervalResponse mervalData = dolaritoMervalClient.getMervalData();

        if (mervalData.getLetras() == null || mervalData.getLetras().isEmpty()) {
            log.warn("No letras data available");
            return List.of();
        }

        return mervalData.getLetras().stream()
                .limit(20)
                .map(this::mapToLetraDTO)
                .toList();
    }

    private LetraDTO mapToLetraDTO(DolaritoMervalClient.LetraItem letra) {
        BigDecimal price = letra.getLastTraded() != null
                ? letra.getLastTraded()
                : letra.getPreviousClose();

        BigDecimal changePercent = BigDecimalUtils.orZero(letra.getVariation());
        BigDecimal change = BigDecimalUtils.percentageChange(letra.getPreviousClose(), changePercent);

        BigDecimal volume = BigDecimalUtils.fromLong(letra.getVolume());

        String currency = letra.getCurrency() != null
                ? letra.getCurrency().getSymbol()
                : FinancialConstants.DEFAULT_CURRENCY;

        return LetraDTO.builder()
                .ticker(StringUtils.orEmpty(letra.getTicker()))
                .name(StringUtils.firstNonBlank(letra.getName(), letra.getTicker()))
                .price(BigDecimalUtils.orZero(price))
                .change(change)
                .changePercent(changePercent)
                .volume(volume)
                .currency(currency)
                .lastUpdate(DateTimeUtils.fromEpochMillis(letra.getQuoteTimestamp()))
                .maturityDate(null)
                .build();
    }
}
