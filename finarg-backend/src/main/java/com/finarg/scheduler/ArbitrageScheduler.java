package com.finarg.scheduler;

import com.finarg.model.dto.ArbitrageDTO;
import com.finarg.model.entity.Alert;
import com.finarg.model.enums.AlertType;
import com.finarg.service.AlertService;
import com.finarg.service.ArbitrageDetectorService;
import com.finarg.service.NotificationService;
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
public class ArbitrageScheduler {

    private final ArbitrageDetectorService arbitrageService;
    private final AlertService alertService;
    private final NotificationService notificationService;

    @Scheduled(cron = "${scheduler.arbitrage.cron:0 */10 * * * *}")
    public void detectAndNotifyArbitrage() {
        log.info("Running scheduled arbitrage detection");
        
        try {
            List<ArbitrageDTO> opportunities = arbitrageService.detectOpportunities();
            
            if (opportunities.isEmpty()) {
                log.debug("No arbitrage opportunities found");
                return;
            }

            log.info("Found {} arbitrage opportunities", opportunities.size());

            List<Alert> arbitrageAlerts = alertService.getActiveAlerts().stream()
                    .filter(a -> a.getType() == AlertType.ARBITRAGE_OPPORTUNITY)
                    .toList();

            for (Alert alert : arbitrageAlerts) {
                for (ArbitrageDTO opportunity : opportunities) {
                    if (opportunity.isViable() && alert.isEmailNotification()) {
                        String description = String.format("%s -> %s (Spread: %.2f%%)",
                                opportunity.getSourceType().getName(),
                                opportunity.getTargetType().getName(),
                                opportunity.getSpreadPercentage());
                        
                        notificationService.sendArbitrageAlert(
                                alert.getUser().getEmail(),
                                description,
                                opportunity.getEstimatedProfitPer1000USD().toString()
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error in arbitrage detection: {}", e.getMessage());
        }
    }
}
