package com.finarg.realestate.dto;

import lombok.Builder;

@Builder
public record NeighborhoodDTO(
    String code,
    String name,
    String cityCode,
    String zoneName,
    Boolean isActive
) {
}
