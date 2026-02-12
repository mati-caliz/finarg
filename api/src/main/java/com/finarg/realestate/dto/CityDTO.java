package com.finarg.realestate.dto;

import lombok.Builder;

@Builder
public record CityDTO(
    String code,
    String name,
    String country,
    Boolean isActive
) {
}
