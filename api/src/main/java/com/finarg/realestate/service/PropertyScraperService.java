package com.finarg.realestate.service;

import com.finarg.realestate.client.PropertyClient;
import com.finarg.realestate.client.factory.PropertyClientFactory;
import com.finarg.realestate.dto.ScrapedPropertyDTO;
import com.finarg.realestate.entity.Neighborhood;
import com.finarg.realestate.entity.Property;
import com.finarg.realestate.entity.PropertyPrice;
import com.finarg.realestate.enums.OperationType;
import com.finarg.realestate.enums.PropertyType;
import com.finarg.realestate.repository.NeighborhoodRepository;
import com.finarg.realestate.repository.PropertyPriceRepository;
import com.finarg.realestate.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class PropertyScraperService {

    private final PropertyClientFactory clientFactory;
    private final NeighborhoodRepository neighborhoodRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyPriceRepository propertyPriceRepository;

    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void scrapeAllProperties() {
        log.info("Starting daily property scraping job");

        List<Neighborhood> neighborhoods = neighborhoodRepository.findByIsActiveTrue();
        log.info("Found {} active neighborhoods to scrape", neighborhoods.size());

        int totalScraped = 0;
        int totalSaved = 0;

        for (Neighborhood neighborhood : neighborhoods) {
            try {
                int scraped = scrapeNeighborhood(neighborhood);
                totalScraped += scraped;
                totalSaved += scraped;
            } catch (Exception e) {
                log.error("Error scraping neighborhood {}: {}", neighborhood.getName(), e.getMessage());
            }
        }

        markStalePropertiesAsInactive();

        log.info("Daily scraping job completed: {} properties scraped, {} saved",
                 totalScraped, totalSaved);
    }

    @Transactional
    public int scrapeByNeighborhoodCode(String neighborhoodCode) {
        log.info("Starting manual scraping for neighborhood: {}", neighborhoodCode);

        Neighborhood neighborhood = neighborhoodRepository.findByCode(neighborhoodCode)
            .orElseThrow(() -> new IllegalArgumentException("Neighborhood not found: " + neighborhoodCode));

        int scraped = scrapeNeighborhood(neighborhood);
        log.info("Manual scraping completed for {}: {} properties scraped", neighborhoodCode, scraped);

        return scraped;
    }

    private int scrapeNeighborhood(Neighborhood neighborhood) {
        log.info("Scraping neighborhood: {}", neighborhood.getName());

        List<PropertyClient> clients = clientFactory.getClientsForCity(
            neighborhood.getCity().getCode()
        );

        Set<String> seenPropertyKeys = new HashSet<>();
        int savedCount = 0;

        for (PropertyType propertyType : List.of(PropertyType.APARTMENT, PropertyType.HOUSE)) {
            for (OperationType operationType : List.of(OperationType.SALE, OperationType.RENT)) {
                for (PropertyClient client : clients) {
                    try {
                        List<ScrapedPropertyDTO> scrapedProperties = client.scrapeProperties(
                            neighborhood.getCity().getCode(),
                            neighborhood.getCode(),
                            propertyType,
                            operationType
                        );

                        for (ScrapedPropertyDTO scraped : scrapedProperties) {
                            String propertyKey = scraped.portalSource() + ":" + scraped.externalId();

                            if (!seenPropertyKeys.contains(propertyKey)) {
                                saveOrUpdateProperty(scraped, neighborhood);
                                seenPropertyKeys.add(propertyKey);
                                savedCount++;
                            }
                        }

                        Thread.sleep(3000);

                    } catch (Exception e) {
                        log.warn("Error scraping {} for {} {}: {}",
                            client.getPortalName(), propertyType, operationType, e.getMessage());
                    }
                }
            }
        }

        log.info("Saved {} properties for neighborhood {}", savedCount, neighborhood.getName());
        return savedCount;
    }

    private void saveOrUpdateProperty(ScrapedPropertyDTO scraped, Neighborhood neighborhood) {
        Property property = propertyRepository
            .findByExternalIdAndPortalSource(scraped.externalId(), scraped.portalSource())
            .orElse(null);

        if (property == null) {
            property = Property.builder()
                .externalId(scraped.externalId())
                .portalSource(scraped.portalSource())
                .neighborhood(neighborhood)
                .build();
        }

        property.setPropertyType(scraped.propertyType());
        property.setOperationType(scraped.operationType());
        property.setAddress(scraped.address());
        property.setSurfaceM2(scraped.surfaceM2());
        property.setCoveredSurfaceM2(scraped.coveredSurfaceM2());
        property.setBedrooms(scraped.bedrooms());
        property.setBathrooms(scraped.bathrooms());
        property.setPropertyCondition(scraped.condition());
        property.setIsActive(true);

        property = propertyRepository.save(property);

        savePriceHistory(property, scraped);
    }

    private void savePriceHistory(Property property, ScrapedPropertyDTO scraped) {
        if (scraped.price() == null) {
            return;
        }

        LocalDate today = LocalDate.now();

        propertyPriceRepository.findLatestByPropertyIdBeforeDate(property.getId(), today)
            .ifPresentOrElse(
                latestPrice -> {
                    if (!latestPrice.getDate().equals(today)) {
                        createPriceRecord(property, scraped, today);
                    } else if (!latestPrice.getPriceTotal().equals(scraped.price())) {
                        latestPrice.setPriceTotal(scraped.price());
                        latestPrice.setPricePerM2(calculatePricePerM2(scraped));
                        latestPrice.setExpenses(scraped.expenses());
                        propertyPriceRepository.save(latestPrice);
                    }
                },
                () -> createPriceRecord(property, scraped, today)
            );
    }

    private void createPriceRecord(Property property, ScrapedPropertyDTO scraped, LocalDate date) {
        PropertyPrice priceRecord = PropertyPrice.builder()
            .property(property)
            .date(date)
            .priceTotal(scraped.price())
            .pricePerM2(calculatePricePerM2(scraped))
            .currency(scraped.currency())
            .expenses(scraped.expenses())
            .build();

        propertyPriceRepository.save(priceRecord);
    }

    private BigDecimal calculatePricePerM2(ScrapedPropertyDTO scraped) {
        if (scraped.price() == null || scraped.surfaceM2() == null
            || scraped.surfaceM2().compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        return scraped.price().divide(scraped.surfaceM2(), 2, RoundingMode.HALF_UP);
    }

    private void markStalePropertiesAsInactive() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(7);
        List<Property> staleProperties = propertyRepository.findAll().stream()
            .filter(p -> p.getLastSeenAt() != null && p.getLastSeenAt().isBefore(threshold))
            .filter(Property::getIsActive)
            .toList();

        for (Property property : staleProperties) {
            property.setIsActive(false);
            propertyRepository.save(property);
        }

        log.info("Marked {} stale properties as inactive", staleProperties.size());
    }
}
