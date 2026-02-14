package com.finarg.news.scheduler;

import com.finarg.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "scheduler", name = "enabled", havingValue = "true", matchIfMissing = true)
public class NewsAggregationScheduler {

    private final NewsService newsService;

    @Scheduled(cron = "${scheduler.news.cron:0 */30 * * * *}")
    public void aggregateNews() {
        log.info("Starting scheduled news aggregation");
        try {
            newsService.aggregateNews();
            log.info("Scheduled news aggregation completed successfully");
        } catch (Exception e) {
            log.error("Error during scheduled news aggregation: {}", e.getMessage(), e);
        }
    }
}
