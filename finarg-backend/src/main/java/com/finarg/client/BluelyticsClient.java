package com.finarg.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finarg.model.dto.QuoteDTO;
import com.finarg.model.enums.Country;
import com.finarg.model.enums.CurrencyType;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.Optional;

@Slf4j
@Component
public class BluelyticsClient {

    private final WebClient webClient;

    public BluelyticsClient(@Qualifier("bluelyticsWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public Optional<QuoteDTO> getEuroBlueQuote() {
        try {
            BluelyticsResponse response = webClient.get()
                    .uri("/latest")
                    .retrieve()
                    .bodyToMono(BluelyticsResponse.class)
                    .block();
            if (response == null || response.getBlueEuro() == null) {
                return Optional.empty();
            }
            BlueEuroData data = response.getBlueEuro();
            BigDecimal buy = data.getValueBuy() != null ? data.getValueBuy() : BigDecimal.ZERO;
            BigDecimal sell = data.getValueSell() != null ? data.getValueSell() : BigDecimal.ZERO;
            LocalDateTime lastUpdate = LocalDateTime.now();
            if (response.getLastUpdate() != null) {
                try {
                    lastUpdate = ZonedDateTime.parse(response.getLastUpdate()).toLocalDateTime();
                } catch (Exception ignored) {
                }
            }
            return Optional.of(QuoteDTO.builder()
                    .type(CurrencyType.AR_EUR_BLUE)
                    .country(Country.ARGENTINA)
                    .name("Euro Blue")
                    .buy(buy)
                    .sell(sell)
                    .spread(sell.subtract(buy))
                    .variation(BigDecimal.ZERO)
                    .lastUpdate(lastUpdate)
                    .build());
        } catch (Exception e) {
            log.error("Error fetching Euro Blue from Bluelytics: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Data
    public static class BluelyticsResponse {
        @JsonProperty("blue_euro")
        private BlueEuroData blueEuro;
        @JsonProperty("last_update")
        private String lastUpdate;
    }

    @Data
    public static class BlueEuroData {
        @JsonProperty("value_buy")
        private BigDecimal valueBuy;
        @JsonProperty("value_sell")
        private BigDecimal valueSell;
        @JsonProperty("value_avg")
        private BigDecimal valueAvg;
    }
}
