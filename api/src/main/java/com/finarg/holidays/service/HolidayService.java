package com.finarg.holidays.service;

import com.finarg.holidays.client.ArgentinaHolidaysClient;
import com.finarg.holidays.dto.HolidayResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class HolidayService {

    private final ArgentinaHolidaysClient argentinaHolidaysClient;

    @Cacheable(value = "holidays", key = "#year")
    public List<HolidayResponseDTO> getHolidaysByYear(int year) {
        log.info("Fetching holidays for year: {}", year);
        List<ArgentinaHolidaysClient.HolidayApiResponse> holidays = 
                argentinaHolidaysClient.getHolidaysByYear(year);

        LocalDate today = LocalDate.now();

        return holidays.stream()
                .map(h -> HolidayResponseDTO.builder()
                        .date(h.fecha())
                        .name(h.nombre())
                        .type(h.tipo())
                        .isNational(h.nacional() != null ? h.nacional() : false)
                        .daysUntil(calculateDaysUntil(today, h.fecha()))
                        .build())
                .sorted(Comparator.comparing(HolidayResponseDTO::date))
                .toList();
    }

    @Cacheable(value = "holidays", key = "'upcoming'")
    public List<HolidayResponseDTO> getUpcomingHolidays() {
        log.info("Fetching upcoming holidays");
        LocalDate today = LocalDate.now();
        int currentYear = today.getYear();
        int nextYear = currentYear + 1;

        List<ArgentinaHolidaysClient.HolidayApiResponse> currentYearHolidays = 
                argentinaHolidaysClient.getHolidaysByYear(currentYear);
        List<ArgentinaHolidaysClient.HolidayApiResponse> nextYearHolidays = 
                argentinaHolidaysClient.getHolidaysByYear(nextYear);

        return Stream.concat(currentYearHolidays.stream(), nextYearHolidays.stream())
                .filter(h -> h.fecha().isAfter(today) || h.fecha().isEqual(today))
                .map(h -> HolidayResponseDTO.builder()
                        .date(h.fecha())
                        .name(h.nombre())
                        .type(h.tipo())
                        .isNational(h.nacional() != null ? h.nacional() : false)
                        .daysUntil(calculateDaysUntil(today, h.fecha()))
                        .build())
                .sorted(Comparator.comparing(HolidayResponseDTO::date))
                .toList();
    }

    private Long calculateDaysUntil(LocalDate from, LocalDate to) {
        if (to == null) {
            return null;
        }
        return ChronoUnit.DAYS.between(from, to);
    }
}
