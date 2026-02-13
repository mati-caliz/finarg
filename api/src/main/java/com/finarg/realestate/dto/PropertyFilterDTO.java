package com.finarg.realestate.dto;

import com.finarg.realestate.enums.OperationType;
import com.finarg.realestate.enums.PropertyType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record PropertyFilterDTO(
    @NotNull(message = "City code is required")
    String cityCode,

    String neighborhoodCode,

    PropertyType propertyType,

    OperationType operationType,

    @PositiveOrZero(message = "Min price must be positive or zero")
    BigDecimal minPrice,

    @PositiveOrZero(message = "Max price must be positive or zero")
    BigDecimal maxPrice,

    @PositiveOrZero(message = "Min surface must be positive or zero")
    BigDecimal minSurfaceM2,

    @PositiveOrZero(message = "Max surface must be positive or zero")
    BigDecimal maxSurfaceM2,

    String currency,

    String portalSource,

    String sortBy,

    @Min(value = 0, message = "Page must be 0 or greater")
    Integer page,

    @Min(value = 1, message = "Size must be at least 1")
    Integer size
) {
    public PropertyFilterDTO {
        if (currency == null || currency.isEmpty()) {
            currency = "USD";
        }
        if (page == null) {
            page = 0;
        }
        if (size == null) {
            size = 20;
        }
    }
}
