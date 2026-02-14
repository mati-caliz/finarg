package com.finarg.investments.cedear.service;

import com.finarg.investments.cedear.dto.CedearDTO;
import com.finarg.investments.stocks.client.DolaritoMervalClient;
import com.finarg.shared.constants.FinancialConstants;
import com.finarg.shared.util.BigDecimalUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
                .filter(cedear -> POPULAR_CEDEARS.contains(cedear.getNombreCorto()))
                .sorted(Comparator.comparing(
                        cedear -> POPULAR_CEDEARS.indexOf(cedear.getNombreCorto())
                ))
                .map(this::mapToCedearDTO)
                .toList();
    }

    private CedearDTO mapToCedearDTO(DolaritoMervalClient.CedearItem cedear) {
        BigDecimal lastPrice = cedear.getUltOperado() != null
                ? cedear.getUltOperado()
                : cedear.getCierreAnterior();

        BigDecimal changePercent = BigDecimalUtils.orZero(cedear.getVariacion());
        BigDecimal change = BigDecimalUtils.percentageChange(cedear.getCierreAnterior(), changePercent);

        BigDecimal volume = cedear.getVolumen() != null
                ? new BigDecimal(cedear.getVolumen())
                : BigDecimal.ZERO;

        String currency = cedear.getMoneda() != null
                ? cedear.getMoneda().getSimbolo()
                : FinancialConstants.DEFAULT_CURRENCY;

        return CedearDTO.builder()
                .symbol(cedear.getNombreCorto() != null ? cedear.getNombreCorto() : "")
                .ticker(cedear.getNombreCorto() != null ? cedear.getNombreCorto() : "")
                .companyName(cedear.getNombre() != null ? cedear.getNombre() : cedear.getNombreCorto())
                .lastPrice(BigDecimalUtils.orZero(lastPrice))
                .change(change)
                .changePercent(changePercent)
                .volume(volume)
                .currency(currency)
                .lastUpdate(LocalDateTime.now())
                .build();
    }
}
