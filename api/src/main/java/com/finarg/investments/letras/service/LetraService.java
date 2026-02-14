package com.finarg.investments.letras.service;

import com.finarg.investments.letras.dto.LetraDTO;
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
                .collect(Collectors.toList());
    }

    private LetraDTO mapToLetraDTO(DolaritoMervalClient.LetraItem letra) {
        LocalDateTime lastUpdate = letra.getTimestampCotizacion() != null
                ? LocalDateTime.ofInstant(Instant.ofEpochMilli(letra.getTimestampCotizacion()), ZoneId.systemDefault())
                : LocalDateTime.now();

        BigDecimal price = letra.getUltOperado() != null
                ? letra.getUltOperado()
                : letra.getCierreAnterior();

        BigDecimal changePercent = letra.getVariacion() != null
                ? letra.getVariacion()
                : BigDecimal.ZERO;

        BigDecimal change = BigDecimal.ZERO;
        if (letra.getCierreAnterior() != null && changePercent != null) {
            change = letra.getCierreAnterior()
                    .multiply(changePercent)
                    .divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
        }

        BigDecimal volume = letra.getVolumen() != null
                ? new BigDecimal(letra.getVolumen())
                : BigDecimal.ZERO;

        String currency = letra.getMoneda() != null
                ? letra.getMoneda().getSimbolo()
                : "ARS";

        return LetraDTO.builder()
                .ticker(letra.getTicker() != null ? letra.getTicker() : "")
                .name(letra.getNombre() != null ? letra.getNombre() : letra.getTicker())
                .price(price != null ? price : BigDecimal.ZERO)
                .change(change)
                .changePercent(changePercent != null ? changePercent : BigDecimal.ZERO)
                .volume(volume)
                .currency(currency)
                .lastUpdate(lastUpdate)
                .maturityDate(null)
                .build();
    }
}
