package com.finarg.investments.metals.service;

import com.finarg.investments.metals.client.MetalsAPIClient;
import com.finarg.investments.metals.dto.MetalDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetalService {
    private final MetalsAPIClient metalsAPIClient;

    private static final Map<String, String> METAL_NAMES = Map.of(
            "XAU", "GOLD",
            "XAG", "SILVER",
            "XPT", "PLATINUM",
            "XPD", "PALLADIUM"
    );

    @Cacheable(value = "metals", key = "'all'")
    public List<MetalDTO> getAllMetals() {
        log.info("Fetching all metals prices");

        MetalsAPIClient.MetalsAPIResponse response = metalsAPIClient.getMetalsPrices();

        if (response == null || response.getRates() == null || response.getRates().isEmpty()) {
            log.warn("No metals data available");
            return List.of();
        }

        List<MetalDTO> metals = new ArrayList<>();
        LocalDateTime lastUpdate = response.getTimestamp() != null
                ? LocalDateTime.ofInstant(Instant.ofEpochSecond(response.getTimestamp()), ZoneId.systemDefault())
                : LocalDateTime.now();

        for (Map.Entry<String, BigDecimal> entry : response.getRates().entrySet()) {
            String code = entry.getKey();
            BigDecimal inverseRate = entry.getValue();

            if (inverseRate == null || inverseRate.compareTo(BigDecimal.ZERO) <= 0) {
                log.warn("Invalid rate for metal {}: {}", code, inverseRate);
                continue;
            }

            String metalType = METAL_NAMES.getOrDefault(code, code);

            BigDecimal priceUsd = BigDecimal.ONE.divide(inverseRate, 2, java.math.RoundingMode.HALF_UP);

            MetalDTO metal = MetalDTO.builder()
                    .metalType(metalType)
                    .unit("oz")
                    .priceUsd(priceUsd)
                    .change24h(BigDecimal.ZERO)
                    .changePercent24h(BigDecimal.ZERO)
                    .lastUpdate(lastUpdate)
                    .build();

            metals.add(metal);
        }

        log.info("Fetched {} metals", metals.size());
        return metals;
    }
}
