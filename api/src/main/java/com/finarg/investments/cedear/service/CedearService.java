package com.finarg.investments.cedear.service;

import com.finarg.investments.cedear.dto.CedearDTO;
import com.finarg.investments.stocks.client.DolaritoMervalClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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
                .filter(cedear -> POPULAR_CEDEARS.contains(cedear.getNombreCorto()))
                .sorted(Comparator.comparing(
                        cedear -> POPULAR_CEDEARS.indexOf(cedear.getNombreCorto())
                ))
                .map(this::mapToCedearDTO)
                .collect(Collectors.toList());
    }

    private CedearDTO mapToCedearDTO(DolaritoMervalClient.CedearItem cedear) {
        LocalDateTime lastUpdate = LocalDateTime.now();

        BigDecimal lastPrice = cedear.getUltOperado() != null
                ? cedear.getUltOperado()
                : cedear.getCierreAnterior();

        BigDecimal changePercent = cedear.getVariacion() != null
                ? cedear.getVariacion()
                : BigDecimal.ZERO;

        BigDecimal change = BigDecimal.ZERO;
        if (cedear.getCierreAnterior() != null && changePercent != null) {
            change = cedear.getCierreAnterior()
                    .multiply(changePercent)
                    .divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
        }

        BigDecimal volume = cedear.getVolumen() != null
                ? new BigDecimal(cedear.getVolumen())
                : BigDecimal.ZERO;

        String currency = cedear.getMoneda() != null
                ? cedear.getMoneda().getSimbolo()
                : "ARS";

        return CedearDTO.builder()
                .symbol(cedear.getNombreCorto() != null ? cedear.getNombreCorto() : "")
                .ticker(cedear.getNombreCorto() != null ? cedear.getNombreCorto() : "")
                .companyName(cedear.getNombre() != null ? cedear.getNombre() : cedear.getNombreCorto())
                .lastPrice(lastPrice != null ? lastPrice : BigDecimal.ZERO)
                .change(change)
                .changePercent(changePercent != null ? changePercent : BigDecimal.ZERO)
                .volume(volume)
                .currency(currency)
                .lastUpdate(lastUpdate)
                .build();
    }
}
