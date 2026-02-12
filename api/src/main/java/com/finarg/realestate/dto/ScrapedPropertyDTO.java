package com.finarg.realestate.dto;

import com.finarg.realestate.enums.OperationType;
import com.finarg.realestate.enums.PropertyCondition;
import com.finarg.realestate.enums.PropertyType;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record ScrapedPropertyDTO(
    String externalId,
    String portalSource,
    PropertyType propertyType,
    OperationType operationType,
    String neighborhoodCode,
    String address,
    BigDecimal surfaceM2,
    BigDecimal coveredSurfaceM2,
    Integer bedrooms,
    Integer bathrooms,
    BigDecimal price,
    String currency,
    BigDecimal expenses,
    PropertyCondition condition
) {
}
