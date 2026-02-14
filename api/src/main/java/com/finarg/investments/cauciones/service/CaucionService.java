package com.finarg.investments.cauciones.service;

import com.finarg.investments.cauciones.dto.CaucionDTO;
import com.finarg.investments.stocks.client.DolaritoMervalClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

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
                .collect(Collectors.toList());
    }

    private CaucionDTO mapToCaucionDTO(DolaritoMervalClient.CaucionItem caucion) {
        LocalDateTime lastUpdate = caucion.getCloseTimestamp() != null
                ? LocalDateTime.ofInstant(Instant.ofEpochMilli(caucion.getCloseTimestamp()), ZoneId.systemDefault())
                : LocalDateTime.now();

        BigDecimal rate = caucion.getLastPrice() != null
                ? caucion.getLastPrice()
                : BigDecimal.ZERO;

        BigDecimal changePercent = caucion.getVariation() != null
                ? caucion.getVariation()
                : BigDecimal.ZERO;

        BigDecimal change = BigDecimal.ZERO;
        if (caucion.getClosePrevious() != null && changePercent != null) {
            change = caucion.getClosePrevious()
                    .multiply(changePercent)
                    .divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
        }

        return CaucionDTO.builder()
                .days(caucion.getDays() != null ? caucion.getDays() : 0)
                .ticker(caucion.getTicker() != null ? caucion.getTicker() : "")
                .rate(rate)
                .change(change)
                .changePercent(changePercent)
                .minRate(caucion.getMinDay() != null ? caucion.getMinDay() : BigDecimal.ZERO)
                .maxRate(caucion.getMaxDay() != null ? caucion.getMaxDay() : BigDecimal.ZERO)
                .lastUpdate(lastUpdate)
                .build();
    }
}
