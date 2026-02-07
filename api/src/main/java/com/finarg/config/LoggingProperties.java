package com.finarg.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.logging")
public class LoggingProperties {

    private Request request = new Request();

    @Data
    public static class Request {
        private boolean enabled = true;
        private boolean includeQueryString = false;
    }
}
