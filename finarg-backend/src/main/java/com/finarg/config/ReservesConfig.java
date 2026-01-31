package com.finarg.config;

import java.math.BigDecimal;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.reserves")
public class ReservesConfig {

    private Map<String, CountryReservesConfig> countries = Map.of();

    @Data
    public static class CountryReservesConfig {
        private Map<String, MethodologyConfig> methodologies = Map.of();
    }

    @Data
    public static class MethodologyConfig {
        private List<LiabilityConfig> liabilities = new ArrayList<>();
    }

    @Data
    public static class LiabilityConfig {
        private String id;
        private String name;
        private BigDecimal amount;
    }
}
