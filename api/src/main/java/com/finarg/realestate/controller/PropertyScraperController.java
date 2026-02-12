package com.finarg.realestate.controller;

import com.finarg.realestate.service.PropertyScraperService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/real-estate/scraper")
@RequiredArgsConstructor
@Tag(name = "Property Scraper", description = "Manual property scraping operations")
@Slf4j
public class PropertyScraperController {

    private final PropertyScraperService scraperService;

    @PostMapping("/run")
    @Operation(
        summary = "Run property scraper manually",
        description = "Triggers the property scraping job manually. "
            + "If neighborhoodCode is provided, only scrapes that neighborhood. "
            + "Otherwise, scrapes all active neighborhoods."
    )
    public ResponseEntity<Map<String, Object>> runScraper(
            @RequestParam(required = false) String neighborhoodCode) {

        if (neighborhoodCode != null && !neighborhoodCode.isEmpty()) {
            log.info("Manual scraper execution requested for neighborhood: {}", neighborhoodCode);
        } else {
            log.info("Manual scraper execution requested for all neighborhoods");
        }

        try {
            if (neighborhoodCode != null && !neighborhoodCode.isEmpty()) {
                int propertiesScraped = scraperService.scrapeByNeighborhoodCode(neighborhoodCode);
                log.info("Property scraper completed successfully for {}", neighborhoodCode);
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Property scraping completed for " + neighborhoodCode,
                    "propertiesScraped", propertiesScraped,
                    "neighborhoodCode", neighborhoodCode
                ));
            } else {
                log.info("Starting property scraper service for all neighborhoods...");
                scraperService.scrapeAllProperties();
                log.info("Property scraper completed successfully");
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Property scraping job completed successfully"
                ));
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid neighborhood code: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage(),
                "type", "ValidationError"
            ));
        } catch (Exception e) {
            log.error("Error running manual scraper", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", e.getMessage(),
                "type", e.getClass().getSimpleName()
            ));
        }
    }
}
