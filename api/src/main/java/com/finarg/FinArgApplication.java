package com.finarg;

import com.finarg.core.config.ExternalApisProperties;
import com.finarg.core.config.LoggingProperties;
import com.finarg.core.config.SchedulerProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
@EnableConfigurationProperties({
    ExternalApisProperties.class,
    SchedulerProperties.class,
    LoggingProperties.class
})
public class FinArgApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinArgApplication.class, args);
    }
}
