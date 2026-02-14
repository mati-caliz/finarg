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

        if (data.getSwapChina() != null && data.getSwapChina().compareTo(BigDecimal.ZERO) > 0) {
            liabilities.add(ReserveLiabilityDTO.builder()
                    .id("china_swap")
                    .name("Swap China")
                    .amount(data.getSwapChina().setScale(0, RoundingMode.HALF_UP))
                    .build());
        }

        if (data.getBankDeposits() != null && data.getBankDeposits().compareTo(BigDecimal.ZERO) > 0) {
            liabilities.add(ReserveLiabilityDTO.builder()
                    .id("bank_deposits")
                    .name("Encajes Bancarios")
                    .amount(data.getBankDeposits().setScale(0, RoundingMode.HALF_UP))
                    .build());
        }

        if (data.getSwapUsa() != null && data.getSwapUsa().compareTo(BigDecimal.ZERO) > 0) {
            liabilities.add(ReserveLiabilityDTO.builder()
                    .id("usa_swap")
                    .name("Swap EEUU")
                    .amount(data.getSwapUsa().setScale(0, RoundingMode.HALF_UP))
                    .build());
        }

        if (data.getRepoSedesa() != null && data.getRepoSedesa().compareTo(BigDecimal.ZERO) > 0) {
            liabilities.add(ReserveLiabilityDTO.builder()
                    .id("sedesa_repo")
                    .name("REPO SEDESA y otros")
                    .amount(data.getRepoSedesa().setScale(0, RoundingMode.HALF_UP))
                    .build());
        }

        if (data.getOtherShortTermBcra() != null && data.getOtherShortTermBcra().compareTo(BigDecimal.ZERO) > 0) {
            liabilities.add(ReserveLiabilityDTO.builder()
                    .id("other_bcra")
                    .name("Otros pasivos BCRA")
                    .amount(data.getOtherShortTermBcra().setScale(0, RoundingMode.HALF_UP))
                    .build());
        }

        return liabilities;
    }

    private List<ReserveLiabilityDTO> buildFmiLiabilities(BcraExcelLiabilitiesDTO data) {
        List<ReserveLiabilityDTO> liabilities = new ArrayList<>(buildBcraLiabilities(data));

        if (data.getGovernmentDeposits() != null && data.getGovernmentDeposits().compareTo(BigDecimal.ZERO) > 0) {
            liabilities.add(ReserveLiabilityDTO.builder()
                    .id("gov_deposits")
                    .name("Depósitos del Gobierno")
                    .amount(data.getGovernmentDeposits().setScale(0, RoundingMode.HALF_UP))
                    .build());
        }

        if (data.getLeliqPases() != null && data.getLeliqPases().compareTo(BigDecimal.ZERO) > 0) {
            liabilities.add(ReserveLiabilityDTO.builder()
                    .id("leliq_pases")
                    .name("LELIQs y pases (USD)")
                    .amount(data.getLeliqPases().setScale(0, RoundingMode.HALF_UP))
                    .build());
        }

        if (data.getTreasuryLiabilitiesFmi() != null && data.getTreasuryLiabilitiesFmi().compareTo(BigDecimal.ZERO) > 0) {
            liabilities.add(ReserveLiabilityDTO.builder()
                    .id("other_fmi")
                    .name("Pasivos del Tesoro (programa FMI)")
                    .amount(data.getTreasuryLiabilitiesFmi().setScale(0, RoundingMode.HALF_UP))
                    .build());
        }

        return liabilities;
    }

    private static final int MAX_HISTORY_DAYS = 3650;

    @Cacheable(value = "reserves", key = "'history_' + #days")
    public List<DatosGobArClient.SeriesDataPoint> getHistory(int days) {
        int limit = Math.min(days, MAX_HISTORY_DAYS);
        return datosGobArClient.getBCRAReserves(limit);
    }
}
