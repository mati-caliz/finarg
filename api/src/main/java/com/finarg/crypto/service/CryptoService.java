package com.finarg.crypto.service;

import com.finarg.crypto.client.CoinGeckoClient;
import com.finarg.crypto.dto.CryptoDTO;
import com.finarg.shared.util.BigDecimalUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CryptoService {

    private final CoinGeckoClient coinGeckoClient;

    private record CryptoDefinition(String apiKey, String symbol, String name) { }

    private static final List<CryptoDefinition> SUPPORTED_CRYPTOS = List.of(
            new CryptoDefinition("bitcoin", "BTC", "Bitcoin"),
            new CryptoDefinition("ethereum", "ETH", "Ethereum"),
            new CryptoDefinition("binancecoin", "BNB", "Binance Coin"),
            new CryptoDefinition("ripple", "XRP", "Ripple"),
            new CryptoDefinition("cardano", "ADA", "Cardano"),
            new CryptoDefinition("solana", "SOL", "Solana")
    );

    @Cacheable(value = "crypto", key = "'current'")
    public List<CryptoDTO> getCurrentCryptoPrices() {
        log.info("Fetching current crypto prices");
        Map<String, CoinGeckoClient.CryptoPriceData> response = coinGeckoClient.getCryptoPrices();

        if (response == null || response.isEmpty()) {
            log.warn("No crypto data available from API");
            return List.of();
        }

        LocalDateTime now = LocalDateTime.now();
        List<CryptoDTO> cryptoList = new ArrayList<>();

        for (CryptoDefinition crypto : SUPPORTED_CRYPTOS) {
            CoinGeckoClient.CryptoPriceData data = response.get(crypto.apiKey());
            if (data == null) {
                continue;
            }
            cryptoList.add(CryptoDTO.builder()
                    .symbol(crypto.symbol())
                    .name(crypto.name())
                    .priceUsd(BigDecimalUtils.orZero(data.getUsd()))
                    .change24h(BigDecimalUtils.orZero(data.getUsd24hChange()))
                    .lastUpdate(now)
                    .build());
        }

        return cryptoList;
    }
}
