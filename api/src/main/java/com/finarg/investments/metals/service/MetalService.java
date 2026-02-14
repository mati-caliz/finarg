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

        Map<String, MetalsAPIClient.MetalQuote> metalsPrices = metalsAPIClient.getMetalsPrices();

        if (metalsPrices == null || metalsPrices.isEmpty()) {
            log.warn("No metals data available");
            return List.of();
        }

        List<MetalDTO> metals = new ArrayList<>();

        for (Map.Entry<String, MetalsAPIClient.MetalQuote> entry : metalsPrices.entrySet()) {
            String code = entry.getKey();
            MetalsAPIClient.MetalQuote quote = entry.getValue();

            if (quote == null || quote.getPrice() == null || quote.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                log.warn("Invalid quote for metal {}", code);
                continue;
            }

            String metalType = METAL_NAMES.getOrDefault(code, code);

            LocalDateTime lastUpdate = quote.getTimestamp() != null
                    ? LocalDateTime.ofInstant(Instant.ofEpochSecond(quote.getTimestamp()), ZoneId.systemDefault())
                    : LocalDateTime.now();

            MetalDTO metal = MetalDTO.builder()
                    .metalType(metalType)
                    .unit("oz")
                    .priceUsd(quote.getPrice())
                    .change24h(quote.getChange() != null ? quote.getChange() : BigDecimal.ZERO)
                    .changePercent24h(quote.getPercentChange() != null ? quote.getPercentChange() : BigDecimal.ZERO)
                    .lastUpdate(lastUpdate)
                    .build();

            metals.add(metal);
        }

        log.info("Fetched {} metals", metals.size());
        return metals;
    }
}
