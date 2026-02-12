package com.finarg.realestate.dto;

import com.finarg.realestate.enums.OperationType;
import com.finarg.realestate.enums.PropertyType;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record PropertyPriceResponseDTO(
    String cityCode,
    String cityName,
    String neighborhoodCode,
    String neighborhoodName,
    PropertyType propertyType,
    OperationType operationType,
    String currency,
    PriceStatisticsDTO statistics,
    List<PropertyDTO> properties,
    LocalDateTime calculatedAt,
    Integer currentPage,
    Integer pageSize,
    Long totalElements,
    Integer totalPages
) {
}
