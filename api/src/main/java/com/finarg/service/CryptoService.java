package com.finarg.service;

import com.finarg.client.CoinGeckoClient;
import com.finarg.model.dto.CryptoDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CryptoService {

    private final CoinGeckoClient coinGeckoClient;

    @Cacheable(value = "crypto", key = "'current'")
    public List<CryptoDTO> getCurrentCryptoPrices() {
        log.info("Fetching current crypto prices");
        Map<String, CoinGeckoClient.CryptoPriceData> response = coinGeckoClient.getCryptoPrices();

        if (response == null || response.isEmpty()) {
            log.warn("No crypto data available from API");
            return new ArrayList<>();
        }

        List<CryptoDTO> cryptoList = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        if (response.containsKey("bitcoin")) {
            CoinGeckoClient.CryptoPriceData btcData = response.get("bitcoin");
            cryptoList.add(CryptoDTO.builder()
                    .symbol("BTC")
                    .name("Bitcoin")
                    .priceUsd(btcData.getUsd() != null ? btcData.getUsd() : BigDecimal.ZERO)
                    .change24h(btcData.getUsd24hChange() != null ? btcData.getUsd24hChange() : BigDecimal.ZERO)
                    .lastUpdate(now)
                    .build());
        }

        if (response.containsKey("ethereum")) {
            CoinGeckoClient.CryptoPriceData ethData = response.get("ethereum");
            cryptoList.add(CryptoDTO.builder()
                    .symbol("ETH")
                    .name("Ethereum")
                    .priceUsd(ethData.getUsd() != null ? ethData.getUsd() : BigDecimal.ZERO)
                    .change24h(ethData.getUsd24hChange() != null ? ethData.getUsd24hChange() : BigDecimal.ZERO)
                    .lastUpdate(now)
                    .build());
        }

        return cryptoList;
    }
}
