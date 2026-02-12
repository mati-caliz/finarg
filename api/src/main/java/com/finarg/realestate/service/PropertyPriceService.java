package com.finarg.realestate.service;

import com.finarg.realestate.dto.CityDTO;
import com.finarg.realestate.dto.NeighborhoodDTO;
import com.finarg.realestate.dto.PriceStatisticsDTO;
import com.finarg.realestate.dto.PropertyDTO;
import com.finarg.realestate.dto.PropertyFilterDTO;
import com.finarg.realestate.dto.PropertyPriceResponseDTO;
import com.finarg.realestate.entity.City;
import com.finarg.realestate.entity.Neighborhood;
import com.finarg.realestate.entity.Property;
import com.finarg.realestate.entity.PropertyPrice;
import com.finarg.realestate.repository.CityRepository;
import com.finarg.realestate.repository.NeighborhoodRepository;
import com.finarg.realestate.repository.PropertyPriceRepository;
import com.finarg.realestate.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class PropertyPriceService {

    private final PropertyRepository propertyRepository;
    private final PropertyPriceRepository propertyPriceRepository;
    private final CityRepository cityRepository;
    private final NeighborhoodRepository neighborhoodRepository;

    @Cacheable(value = "propertyPrices", key = "#filters.hashCode()", unless = "#result == null")
    public PropertyPriceResponseDTO getPropertyPrices(PropertyFilterDTO filters) {
        log.info("Getting property prices for filters: {}", filters);

        City city = cityRepository.findByCode(filters.cityCode())
            .orElseThrow(() -> new IllegalArgumentException("City not found: " + filters.cityCode()));

        List<Property> properties = findPropertiesByFilters(city, filters);
        log.info("Found {} properties matching filters", properties.size());

        List<PropertyPrice> latestPrices = getLatestPricesForProperties(properties, filters.currency());

        List<PropertyPrice> filteredPrices = applyPriceAndSurfaceFilters(latestPrices, filters);

        PriceStatisticsDTO statistics = calculateStatistics(filteredPrices, filters);

        long totalElements = filteredPrices.size();
        int totalPages = (int) Math.ceil((double) totalElements / filters.size());

        List<PropertyPrice> paginatedPrices = applyPagination(filteredPrices, filters.page(), filters.size());

        List<Property> paginatedProperties = paginatedPrices.stream()
            .map(PropertyPrice::getProperty)
            .toList();

        List<PropertyDTO> propertyDTOs = mapToPropertyDTOs(paginatedProperties, paginatedPrices);

        String neighborhoodName = filters.neighborhoodCode() != null
            ? getNeighborhoodName(filters.neighborhoodCode())
            : null;

        return PropertyPriceResponseDTO.builder()
            .cityCode(city.getCode())
            .cityName(city.getName())
            .neighborhoodCode(filters.neighborhoodCode())
            .neighborhoodName(neighborhoodName)
            .propertyType(filters.propertyType())
            .operationType(filters.operationType())
            .currency(filters.currency())
            .statistics(statistics)
            .properties(propertyDTOs)
            .calculatedAt(LocalDateTime.now())
            .currentPage(filters.page())
            .pageSize(filters.size())
            .totalElements(totalElements)
            .totalPages(totalPages)
            .build();
    }

    @Cacheable(value = "cities", unless = "#result == null || #result.isEmpty()")
    public List<CityDTO> getAvailableCities() {
        log.info("Getting available cities");

        return cityRepository.findByIsActiveTrue().stream()
            .map(city -> CityDTO.builder()
                .code(city.getCode())
                .name(city.getName())
                .country(city.getCountry().name())
                .isActive(city.getIsActive())
                .build())
            .toList();
    }

    @Cacheable(value = "neighborhoods", key = "#cityCode", unless = "#result == null || #result.isEmpty()")
    public List<NeighborhoodDTO> getNeighborhoodsByCity(String cityCode) {
        log.info("Getting neighborhoods for city: {}", cityCode);

        City city = cityRepository.findByCode(cityCode)
            .orElseThrow(() -> new IllegalArgumentException("City not found: " + cityCode));

        return neighborhoodRepository.findByCityIdAndIsActiveTrue(city.getId()).stream()
            .map(neighborhood -> NeighborhoodDTO.builder()
                .code(neighborhood.getCode())
                .name(neighborhood.getName())
                .cityCode(city.getCode())
                .zoneName(neighborhood.getZoneName())
                .isActive(neighborhood.getIsActive())
                .build())
            .toList();
    }

    private List<Property> findPropertiesByFilters(City city, PropertyFilterDTO filters) {
        List<Property> properties;

        if (filters.neighborhoodCode() != null && !filters.neighborhoodCode().isEmpty()) {
            Neighborhood neighborhood = neighborhoodRepository
                .findByCodeAndCityId(filters.neighborhoodCode(), city.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                    "Neighborhood not found: " + filters.neighborhoodCode()));

            if (filters.propertyType() != null && filters.operationType() != null) {
                properties = propertyRepository.findByNeighborhoodIdAndPropertyTypeAndOperationTypeAndIsActiveTrue(
                    neighborhood.getId(),
                    filters.propertyType(),
                    filters.operationType()
                );
            } else {
                properties = propertyRepository.findByNeighborhoodIdAndIsActiveTrue(neighborhood.getId());
            }
        } else {
            properties = propertyRepository.findActiveByCityAndFilters(
                city.getId(),
                filters.propertyType(),
                filters.operationType()
            );
        }

        return properties;
    }

    private List<PropertyPrice> getLatestPricesForProperties(List<Property> properties, String currency) {
        if (properties.isEmpty()) {
            return List.of();
        }

        List<Long> propertyIds = properties.stream()
            .map(Property::getId)
            .toList();

        return propertyPriceRepository.findLatestPricesByPropertyIdsAndCurrency(propertyIds, currency);
    }

    private PriceStatisticsDTO calculateStatistics(
            List<PropertyPrice> prices,
            PropertyFilterDTO filters) {

        if (prices.isEmpty()) {
            return PriceStatisticsDTO.builder()
                .averagePricePerM2(BigDecimal.ZERO)
                .medianPricePerM2(BigDecimal.ZERO)
                .minPricePerM2(BigDecimal.ZERO)
                .maxPricePerM2(BigDecimal.ZERO)
                .averageTotalPrice(BigDecimal.ZERO)
                .medianTotalPrice(BigDecimal.ZERO)
                .propertiesCount(0)
                .totalSurfaceM2Analyzed(BigDecimal.ZERO)
                .build();
        }

        List<BigDecimal> pricesPerM2 = prices.stream()
            .map(PropertyPrice::getPricePerM2)
            .filter(Objects::nonNull)
            .filter(p -> isWithinRange(p, filters.minPrice(), filters.maxPrice()))
            .sorted()
            .toList();

        List<BigDecimal> totalPrices = prices.stream()
            .map(PropertyPrice::getPriceTotal)
            .filter(Objects::nonNull)
            .sorted()
            .toList();

        BigDecimal avgPricePerM2 = calculateAverage(pricesPerM2);
        BigDecimal medianPricePerM2 = calculateMedian(pricesPerM2);
        BigDecimal avgTotalPrice = calculateAverage(totalPrices);
        BigDecimal medianTotalPrice = calculateMedian(totalPrices);
        BigDecimal totalSurface = calculateTotalSurface(prices);

        return PriceStatisticsDTO.builder()
            .averagePricePerM2(avgPricePerM2)
            .medianPricePerM2(medianPricePerM2)
            .minPricePerM2(pricesPerM2.isEmpty() ? BigDecimal.ZERO : pricesPerM2.get(0))
            .maxPricePerM2(pricesPerM2.isEmpty() ? BigDecimal.ZERO : pricesPerM2.get(pricesPerM2.size() - 1))
            .averageTotalPrice(avgTotalPrice)
            .medianTotalPrice(medianTotalPrice)
            .propertiesCount(prices.size())
            .totalSurfaceM2Analyzed(totalSurface)
            .build();
    }

    private List<PropertyDTO> mapToPropertyDTOs(
            List<Property> properties,
            List<PropertyPrice> latestPrices) {

        List<PropertyDTO> dtos = new ArrayList<>();

        for (Property property : properties) {
            latestPrices.stream()
                    .filter(p -> p.getProperty().getId().equals(property.getId()))
                    .findFirst().ifPresent(latestPrice -> dtos.add(PropertyDTO.builder()
                            .id(property.getId())
                            .externalId(property.getExternalId())
                            .portalSource(property.getPortalSource())
                            .propertyType(property.getPropertyType())
                            .operationType(property.getOperationType())
                            .neighborhoodName(property.getNeighborhood().getName())
                            .address(property.getAddress())
                            .surfaceM2(property.getSurfaceM2())
                            .coveredSurfaceM2(property.getCoveredSurfaceM2())
                            .bedrooms(property.getBedrooms())
                            .bathrooms(property.getBathrooms())
                            .currentPrice(latestPrice.getPriceTotal())
                            .pricePerM2(latestPrice.getPricePerM2())
                            .currency(latestPrice.getCurrency())
                            .condition(property.getPropertyCondition())
                            .priceDate(latestPrice.getDate())
                            .lastSeenAt(property.getLastSeenAt())
                            .build()));

        }

        return dtos;
    }

    private boolean isWithinRange(BigDecimal value, BigDecimal min, BigDecimal max) {
        boolean aboveMin = min == null || value.compareTo(min) >= 0;
        boolean belowMax = max == null || value.compareTo(max) <= 0;
        return aboveMin && belowMax;
    }

    private BigDecimal calculateAverage(List<BigDecimal> values) {
        if (values.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal sum = values.stream()
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return sum.divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateMedian(List<BigDecimal> sortedValues) {
        if (sortedValues.isEmpty()) {
            return BigDecimal.ZERO;
        }

        int size = sortedValues.size();
        if (size % 2 == 0) {
            BigDecimal mid1 = sortedValues.get(size / 2 - 1);
            BigDecimal mid2 = sortedValues.get(size / 2);
            return mid1.add(mid2).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        } else {
            return sortedValues.get(size / 2);
        }
    }

    private BigDecimal calculateTotalSurface(List<PropertyPrice> prices) {
        return prices.stream()
            .map(PropertyPrice::getProperty)
            .map(Property::getSurfaceM2)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String getNeighborhoodName(String neighborhoodCode) {
        return neighborhoodRepository.findByCode(neighborhoodCode)
            .map(Neighborhood::getName)
            .orElse(null);
    }

    private List<PropertyPrice> applyPriceAndSurfaceFilters(
            List<PropertyPrice> prices,
            PropertyFilterDTO filters) {

        return prices.stream()
            .filter(price -> {
                boolean priceMatch = isWithinRange(
                    price.getPriceTotal(),
                    filters.minPrice(),
                    filters.maxPrice()
                );

                boolean surfaceMatch = isWithinRange(
                    price.getProperty().getSurfaceM2(),
                    filters.minSurfaceM2(),
                    filters.maxSurfaceM2()
                );

                return priceMatch && surfaceMatch;
            })
            .toList();
    }

    private List<PropertyPrice> applyPagination(
            List<PropertyPrice> prices,
            int page,
            int size) {

        int startIndex = page * size;
        if (startIndex >= prices.size()) {
            return List.of();
        }

        int endIndex = Math.min(startIndex + size, prices.size());
        return prices.subList(startIndex, endIndex);
    }
}
