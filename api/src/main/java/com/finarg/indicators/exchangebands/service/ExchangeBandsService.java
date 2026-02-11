package com.finarg.indicators.exchangebands.service;

import com.finarg.indicators.exchangebands.dto.ExchangeBandsDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Slf4j
@Service
public class ExchangeBandsService {

    @Value("${exchange-bands.floor:906.51}")
    private BigDecimal floor;

    @Value("${exchange-bands.ceiling:1542.88}")
    private BigDecimal ceiling;

    @Value("${exchange-bands.crawling-peg-monthly:0.01}")
    private BigDecimal crawlingPegMonthly;

    @Value("${exchange-bands.last-update:2025-02-01}")
    private String lastUpdate;

    @Cacheable(value = "exchangeBands", key = "'current'")
    public ExchangeBandsDTO getCurrentBands() {
        log.info("Fetching current exchange bands");

        BigDecimal middle = floor.add(ceiling).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        return ExchangeBandsDTO.builder()
                .floor(floor)
                .ceiling(ceiling)
                .middle(middle)
                .crawlingPegMonthly(crawlingPegMonthly)
                .lastUpdate(LocalDate.parse(lastUpdate))
                .notes("Bandas de flotación del dólar mayorista. Se ajustan mensualmente según crawling peg.")
                .build();
    }
}
