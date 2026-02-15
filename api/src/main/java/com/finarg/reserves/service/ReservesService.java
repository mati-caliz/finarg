package com.finarg.reserves.service;

import com.finarg.reserves.client.BcraClient;
import com.finarg.reserves.client.BcraExcelScraperClient;
import com.finarg.inflation.client.DatosGobArClient;
import com.finarg.reserves.dto.BcraExcelLiabilitiesDTO;
import com.finarg.reserves.dto.ReserveLiabilityDTO;
import com.finarg.reserves.dto.ReservesDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservesService {

    private final DatosGobArClient datosGobArClient;
    private final BcraClient bcraClient;
    private final BcraExcelScraperClient bcraExcelScraperClient;

    @Cacheable(value = "reserves", key = "'current_' + #country")
    public ReservesDTO getCurrentReserves(String country) {
        log.info("Fetching reserves for country: {}", country);

        if (!"ar".equals(country)) {
            return ReservesDTO.builder()
                    .grossReserves(BigDecimal.ZERO)
                    .netReserves(BigDecimal.ZERO)
                    .netReservesBCRA(BigDecimal.ZERO)
                    .netReservesFMI(BigDecimal.ZERO)
                    .liabilitiesBCRA(List.of())
                    .liabilitiesFMI(List.of())
                    .liabilities(List.of())
                    .date(LocalDate.now())
                    .trend("no_data")
                    .build();
        }

        BcraExcelLiabilitiesDTO excelLiabilities = fetchLiabilitiesFromExcel();

        List<ReserveLiabilityDTO> liabilitiesBCRA = buildBcraLiabilities(excelLiabilities);
        List<ReserveLiabilityDTO> liabilitiesFMI = buildFmiLiabilities(excelLiabilities);

        List<ReserveLiabilityDTO> allLiabilities = new ArrayList<>(liabilitiesBCRA);
        liabilitiesFMI.stream()
                .filter(f -> liabilitiesBCRA.stream()
                        .noneMatch(b -> b.getId().equals(f.getId())))
                .forEach(allLiabilities::add);

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
        BigDecimal grossReserves = latest.value();

        BigDecimal totalBCRA = sumLiabilities(liabilitiesBCRA);
        BigDecimal totalFMI = sumLiabilities(liabilitiesFMI);

        BigDecimal netReservesBCRA = grossReserves.subtract(totalBCRA);
        BigDecimal netReservesFMI = grossReserves.subtract(totalFMI);

        BigDecimal variation = BigDecimal.ZERO;
        String trend = "stable";

        if (reserves.size() > 1) {
            DatosGobArClient.SeriesDataPoint previous = reserves.get(1);
            variation = grossReserves.subtract(previous.value());

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
                .date(latest.date())
                .dailyVariation(variation.setScale(0, RoundingMode.HALF_UP))
                .trend(trend)
                .build();
    }

    @Cacheable(value = "reserves", key = "'excel_liabilities'")
    public BcraExcelLiabilitiesDTO fetchLiabilitiesFromExcel() {
        log.info("Fetching liabilities from BCRA Excel file");

        BcraExcelLiabilitiesDTO excelData = bcraExcelScraperClient.fetchLiabilities();

        if (excelData != null && excelData.getBankDeposits() != null && excelData.getBankDeposits().compareTo(BigDecimal.ZERO) > 0) {
            log.info("Successfully fetched liabilities from Excel, using as primary source");
            return excelData;
        }

        log.warn("Excel scraping failed or returned incomplete data, falling back to API sources");
        return buildFallbackLiabilities();
    }

    private BcraExcelLiabilitiesDTO buildFallbackLiabilities() {
        BcraExcelLiabilitiesDTO dto = BcraExcelLiabilitiesDTO.builder()
                .lastUpdate(LocalDate.now())
                .dataSource("BCRA APIs (fallback)")
                .build();

        BigDecimal encajes = bcraClient.getDepositosEntidadesMonedaExtranjera();
        if (encajes != null) {
            dto.setBankDeposits(encajes.setScale(0, RoundingMode.HALF_UP));
        }

        DatosGobArClient.BCRALiabilitiesData datosGob = datosGobArClient.fetchBCRALiabilities();
        if (datosGob != null) {
            dto.setLeliqPases(datosGob.letterLiabilitiesUsd().setScale(0, RoundingMode.HALF_UP));
            dto.setGovernmentDeposits(datosGob.governmentDepositsUsd().setScale(0, RoundingMode.HALF_UP));
        }

        return dto;
    }

    private List<ReserveLiabilityDTO> buildBcraLiabilities(BcraExcelLiabilitiesDTO data) {
        List<ReserveLiabilityDTO> liabilities = new ArrayList<>();
        addIfPositive(liabilities, "china_swap", "Swap China", data.getSwapChina());
        addIfPositive(liabilities, "bank_deposits", "Encajes Bancarios", data.getBankDeposits());
        addIfPositive(liabilities, "usa_swap", "Swap EEUU", data.getSwapUsa());
        addIfPositive(liabilities, "sedesa_repo", "REPO SEDESA y otros", data.getRepoSedesa());
        addIfPositive(liabilities, "other_bcra", "Otros pasivos BCRA", data.getOtherShortTermBcra());
        return liabilities;
    }

    private List<ReserveLiabilityDTO> buildFmiLiabilities(BcraExcelLiabilitiesDTO data) {
        List<ReserveLiabilityDTO> liabilities = new ArrayList<>(buildBcraLiabilities(data));
        addIfPositive(liabilities, "gov_deposits", "Depósitos del Gobierno", data.getGovernmentDeposits());
        addIfPositive(liabilities, "leliq_pases", "LELIQs y pases (USD)", data.getLeliqPases());
        addIfPositive(liabilities, "other_fmi", "Pasivos del Tesoro (programa FMI)", data.getTreasuryLiabilitiesFmi());
        return liabilities;
    }

    private void addIfPositive(List<ReserveLiabilityDTO> list, String id, String name, BigDecimal amount) {
        if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            list.add(ReserveLiabilityDTO.builder()
                    .id(id)
                    .name(name)
                    .amount(amount.setScale(0, RoundingMode.HALF_UP))
                    .build());
        }
    }

    private BigDecimal sumLiabilities(List<ReserveLiabilityDTO> liabilities) {
        return liabilities.stream()
                .map(ReserveLiabilityDTO::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static final int MAX_HISTORY_DAYS = 3650;

    @Cacheable(value = "reserves", key = "'history_' + #days")
    public List<DatosGobArClient.SeriesDataPoint> getHistory(int days) {
        int limit = Math.min(days, MAX_HISTORY_DAYS);
        return datosGobArClient.getBCRAReserves(limit);
    }
}
