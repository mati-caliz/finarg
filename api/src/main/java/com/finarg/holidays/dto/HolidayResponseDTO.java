package com.finarg.holidays.dto;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record HolidayResponseDTO(
    LocalDate date,
    String name,
    String type,
    boolean isNational,
    Long daysUntil
) { }
