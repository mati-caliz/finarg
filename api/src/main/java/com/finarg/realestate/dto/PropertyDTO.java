package com.finarg.realestate.dto;

import com.finarg.realestate.enums.OperationType;
import com.finarg.realestate.enums.PropertyCondition;
import com.finarg.realestate.enums.PropertyType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
public record PropertyDTO(
    Long id,
    String externalId,
    String portalSource,
    PropertyType propertyType,
    OperationType operationType,
    String neighborhoodName,
    String address,
    BigDecimal surfaceM2,
    BigDecimal coveredSurfaceM2,
    Integer bedrooms,
    Integer bathrooms,
    BigDecimal currentPrice,
    BigDecimal pricePerM2,
    String currency,
    PropertyCondition condition,
    LocalDate priceDate,
    LocalDateTime lastSeenAt
) {
}
