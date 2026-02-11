package com.finarg.core.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "scheduler")
public class SchedulerProperties {

    private boolean enabled = true;
    private ArbitrajeConfig arbitraje = new ArbitrajeConfig();

    @Data
    public static class ArbitrajeConfig {
        private String cron = "0 */10 * * * *";
    }
}
