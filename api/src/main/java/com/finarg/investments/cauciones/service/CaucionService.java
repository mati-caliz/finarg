package com.finarg.investments.cauciones.service;

import com.finarg.investments.cauciones.dto.CaucionDTO;
import com.finarg.investments.stocks.client.DolaritoMervalClient;
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
public class CaucionService {
    private final DolaritoMervalClient dolaritoMervalClient;

    @Cacheable(value = "cauciones", key = "'all'")
    public List<CaucionDTO> getAllCauciones() {
        log.info("Fetching cauciones from dolarito.ar");

        DolaritoMervalClient.DolaritoMervalResponse mervalData = dolaritoMervalClient.getMervalData();

        if (mervalData.getCauciones() == null || mervalData.getCauciones().isEmpty()) {
            log.warn("No cauciones data available");
            return List.of();
        }

        return mervalData.getCauciones().stream()
                .map(this::mapToCaucionDTO)
                .toList();
    }

    private CaucionDTO mapToCaucionDTO(DolaritoMervalClient.CaucionItem caucion) {
        BigDecimal changePercent = BigDecimalUtils.orZero(caucion.getVariation());
        BigDecimal change = BigDecimalUtils.percentageChange(caucion.getClosePrevious(), changePercent);

        return CaucionDTO.builder()
                .days(caucion.getDays() != null ? caucion.getDays() : 0)
                .ticker(caucion.getTicker() != null ? caucion.getTicker() : "")
                .rate(BigDecimalUtils.orZero(caucion.getLastPrice()))
                .change(change)
                .changePercent(changePercent)
                .minRate(BigDecimalUtils.orZero(caucion.getMinDay()))
                .maxRate(BigDecimalUtils.orZero(caucion.getMaxDay()))
                .lastUpdate(DateTimeUtils.fromEpochMillis(caucion.getCloseTimestamp()))
                .build();
    }
}
