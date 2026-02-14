package com.finarg.investments.letras.service;

import com.finarg.investments.letras.dto.LetraDTO;
import com.finarg.investments.stocks.client.DolaritoMervalClient;
import com.finarg.shared.constants.FinancialConstants;
import com.finarg.shared.util.BigDecimalUtils;
import com.finarg.shared.util.DateTimeUtils;
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
        BigDecimal price = letra.getUltOperado() != null
                ? letra.getUltOperado()
                : letra.getCierreAnterior();

        BigDecimal changePercent = BigDecimalUtils.orZero(letra.getVariacion());
        BigDecimal change = BigDecimalUtils.percentageChange(letra.getCierreAnterior(), changePercent);

        BigDecimal volume = letra.getVolumen() != null
                ? new BigDecimal(letra.getVolumen())
                : BigDecimal.ZERO;

        String currency = letra.getMoneda() != null
                ? letra.getMoneda().getSimbolo()
                : FinancialConstants.DEFAULT_CURRENCY;

        return LetraDTO.builder()
                .ticker(letra.getTicker() != null ? letra.getTicker() : "")
                .name(letra.getNombre() != null ? letra.getNombre() : letra.getTicker())
                .price(BigDecimalUtils.orZero(price))
                .change(change)
                .changePercent(changePercent)
                .volume(volume)
                .currency(currency)
                .lastUpdate(DateTimeUtils.fromEpochMillis(letra.getTimestampCotizacion()))
                .maturityDate(null)
                .build();
    }
}
