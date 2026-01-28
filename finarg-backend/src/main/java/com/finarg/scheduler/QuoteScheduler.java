package com.finarg.scheduler;

import com.finarg.model.dto.QuoteDTO;
import com.finarg.model.enums.Country;
import com.finarg.service.QuoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "scheduler.enabled", havingValue = "true", matchIfMissing = true)
public class QuoteScheduler {

    private final QuoteService quoteService;

    @Scheduled(cron = "${scheduler.quotes.cron:0 */5 * * * *}")
    public void updateQuotes() {
        log.info("Running scheduled quote update");
        
        try {
            quoteService.refreshCache();
            
            for (Country country : Country.values()) {
                List<QuoteDTO> quotes = quoteService.getAllQuotes(country);
                
                for (QuoteDTO quote : quotes) {
                    quoteService.saveQuoteHistory(quote);
                }
                
                log.info("Updated {} quotes for {}", quotes.size(), country);
            }
        } catch (Exception e) {
            log.error("Error updating quotes: {}", e.getMessage());
        }
    }
}
