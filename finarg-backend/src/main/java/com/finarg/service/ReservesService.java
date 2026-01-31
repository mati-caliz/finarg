package com.finarg.service;

import com.finarg.client.BcraClient;
import com.finarg.client.DatosGobArClient;
import com.finarg.config.ReservesConfig;
import com.finarg.model.dto.ReserveLiabilityDTO;
import com.finarg.model.dto.ReservesDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservesService {

    private static final BigDecimal SCALE_THRESHOLD = new BigDecimal("100000");

    private final DatosGobArClient datosGobArClient;
    private final BcraClient bcraClient;
    private final ReservesConfig reservesConfig;

    @Cacheable(value = "reserves", key = "'current_' + #country")
    public ReservesDTO getCurrentReserves(String country) {
        log.info("Fetching reserves for country: {}", country);

        ReservesConfig.CountryReservesConfig countryConfig = reservesConfig.getCountries()
                .getOrDefault(country, new ReservesConfig.CountryReservesConfig());

        Map<String, BigDecimal> apiOverrides = "ar".equals(country) ? fetchApiLiabilities() : Map.of();

        List<ReserveLiabilityDTO> liabilitiesBCRA = mapLiabilitiesWithOverrides(
                countryConfig.getMethodologies().getOrDefault("bcra", new ReservesConfig.MethodologyConfig()),
                apiOverrides);
        List<ReserveLiabilityDTO> liabilitiesFMI = mapLiabilitiesWithOverrides(
                countryConfig.getMethodologies().getOrDefault("fmi", new ReservesConfig.MethodologyConfig()),
                apiOverrides);

        List<ReserveLiabilityDTO> allLiabilities = new ArrayList<>(liabilitiesBCRA);
        liabilitiesFMI.stream()
                .filter(f -> liabilitiesBCRA.stream().noneMatch(b -> b.getId().equals(f.getId())))
                .forEach(allLiabilities::add);

        if (!"ar".equals(country)) {
            return ReservesDTO.builder()
                    .grossReserves(BigDecimal.ZERO)
                    .netReserves(BigDecimal.ZERO)
                    .netReservesBCRA(BigDecimal.ZERO)
                    .netReservesFMI(BigDecimal.ZERO)
                    .liabilitiesBCRA(liabilitiesBCRA)
                    .liabilitiesFMI(liabilitiesFMI)
                    .liabilities(allLiabilities)
                    .date(LocalDate.now())
                    .trend("no_data")
                    .build();
        }

        List<DatosGobArClient.SeriesDataPoint> reserves = datosGobArClient.getBCRAReserves(2);

        if (reserves.isEmpty()) {
            return ReservesDTO.builder()
                    .grossReserves(BigDecimal.ZERO)
                    .netReserves(BigDecimal.ZERO)
                    .netReservesBCRA(BigDecimal.ZERO)
                    .netReservesFMI(BigDecimal.ZERO)
                    .liabilitiesBCRA(liabilitiesBCRA)
                    .liabilitiesFMI(liabilitiesFMI)
                    .liabilities(allLiabilities)
                    .date(LocalDate.now())
                    .trend("no_data")
                    .build();
        }

        DatosGobArClient.SeriesDataPoint latest = reserves.get(0);
        BigDecimal grossReserves = latest.getValor();

        BigDecimal totalBCRA = liabilitiesBCRA.stream()
                .map(ReserveLiabilityDTO::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalFMI = liabilitiesFMI.stream()
                .map(ReserveLiabilityDTO::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netReservesBCRA = grossReserves.subtract(totalBCRA);
        BigDecimal netReservesFMI = grossReserves.subtract(totalFMI);

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
                .netReserves(netReservesBCRA.setScale(0, RoundingMode.HALF_UP))
                .netReservesBCRA(netReservesBCRA.setScale(0, RoundingMode.HALF_UP))
                .netReservesFMI(netReservesFMI.setScale(0, RoundingMode.HALF_UP))
                .liabilitiesBCRA(liabilitiesBCRA)
                .liabilitiesFMI(liabilitiesFMI)
                .liabilities(allLiabilities)
                .date(latest.getFecha())
                .dailyVariation(variation.setScale(0, RoundingMode.HALF_UP))
                .trend(trend)
                .build();
    }

    private Map<String, BigDecimal> fetchApiLiabilities() {
        Map<String, BigDecimal> overrides = new HashMap<>();
        BigDecimal encajes = bcraClient.getDepositosEntidadesMonedaExtranjera();
        if (encajes != null) {
            overrides.put("bank_deposits", encajes.setScale(0, RoundingMode.HALF_UP));
        }
        DatosGobArClient.BCRALiabilitiesData datosGob = datosGobArClient.fetchBCRALiabilities();
        if (datosGob != null) {
            BigDecimal pasivosLetras = scaleIfNeeded(datosGob.getPasivosLetrasUsd());
            overrides.put("leliq_pases", pasivosLetras.setScale(0, RoundingMode.HALF_UP));
            overrides.put("gov_deposits", datosGob.getDepositosGobiernoUsd().setScale(0, RoundingMode.HALF_UP));
        }
        return overrides;
    }

    private static BigDecimal scaleIfNeeded(BigDecimal value) {
        if (value == null || value.compareTo(SCALE_THRESHOLD) <= 0) {
            return value != null ? value : BigDecimal.ZERO;
        }
        return value.divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP);
    }

    private List<ReserveLiabilityDTO> mapLiabilitiesWithOverrides(
            ReservesConfig.MethodologyConfig methodology,
            Map<String, BigDecimal> overrides) {
        if (methodology == null || methodology.getLiabilities() == null) {
            return List.of();
        }
        return methodology.getLiabilities().stream()
                .map(l -> {
                    BigDecimal amount = overrides.containsKey(l.getId())
                            ? overrides.get(l.getId())
                            : (l.getAmount() != null ? l.getAmount() : BigDecimal.ZERO);
                    return ReserveLiabilityDTO.builder()
                            .id(l.getId())
                            .name(l.getName())
                            .amount(amount)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private static final int MAX_HISTORY_DAYS = 3650;

    @Cacheable(value = "reserves", key = "'history_' + #days")
    public List<DatosGobArClient.SeriesDataPoint> getHistory(int days) {
        int limit = Math.min(days, MAX_HISTORY_DAYS);
        return datosGobArClient.getBCRAReserves(limit);
    }
}
