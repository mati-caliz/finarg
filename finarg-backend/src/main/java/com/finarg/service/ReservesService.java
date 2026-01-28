package com.finarg.service;

import com.finarg.client.DatosGobArClient;
import com.finarg.model.dto.ReservesDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservesService {

    private final DatosGobArClient datosGobArClient;

    private static final BigDecimal CHINA_SWAP = new BigDecimal("18000");
    private static final BigDecimal ESTIMATED_BANK_DEPOSITS = new BigDecimal("10000");
    private static final BigDecimal GOVERNMENT_DEPOSITS = new BigDecimal("3000");

    @Cacheable(value = "reserves", key = "'current'")
    public ReservesDTO getCurrentReserves() {
        log.info("Fetching current BCRA reserves");

        List<DatosGobArClient.SeriesDataPoint> reserves = datosGobArClient.getBCRAReserves(2);

        if (reserves.isEmpty()) {
            return ReservesDTO.builder()
                    .grossReserves(BigDecimal.ZERO)
                    .netReserves(BigDecimal.ZERO)
                    .date(LocalDate.now())
                    .trend("no_data")
                    .build();
        }

        DatosGobArClient.SeriesDataPoint latest = reserves.get(0);
        BigDecimal grossReserves = latest.getValor();

        BigDecimal netReserves = grossReserves
                .subtract(CHINA_SWAP)
                .subtract(ESTIMATED_BANK_DEPOSITS)
                .subtract(GOVERNMENT_DEPOSITS);

        BigDecimal variation = BigDecimal.ZERO;
        String trend = "stable";

        if (reserves.size() > 1) {
            DatosGobArClient.SeriesDataPoint previous = reserves.get(1);
            variation = grossReserves.subtract(previous.getValor());
            
            if (variation.compareTo(BigDecimal.ZERO) > 0) {
                trend = "rising";
            } else if (variation.compareTo(BigDecimal.ZERO) < 0) {
                trend = "falling";
            }
        }

        return ReservesDTO.builder()
                .grossReserves(grossReserves.setScale(0, RoundingMode.HALF_UP))
                .netReserves(netReserves.setScale(0, RoundingMode.HALF_UP))
                .chinaSwap(CHINA_SWAP)
                .bankDeposits(ESTIMATED_BANK_DEPOSITS)
                .governmentDeposits(GOVERNMENT_DEPOSITS)
                .date(latest.getFecha())
                .dailyVariation(variation.setScale(0, RoundingMode.HALF_UP))
                .trend(trend)
                .build();
    }

    @Cacheable(value = "reserves", key = "'history_' + #days")
    public List<DatosGobArClient.SeriesDataPoint> getHistory(int days) {
        return datosGobArClient.getBCRAReserves(days);
    }
}
