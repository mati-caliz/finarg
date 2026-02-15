package com.finarg.holidays.controller;

import com.finarg.holidays.dto.HolidayResponseDTO;
import com.finarg.holidays.service.HolidayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/{country}/feriados")
@RequiredArgsConstructor
@Tag(name = "Holidays", description = "Public holidays information")
public class HolidayController {

    private final HolidayService holidayService;

    @GetMapping
    @Operation(summary = "Get all holidays for a specific year")
    public ResponseEntity<List<HolidayResponseDTO>> getHolidaysByYear(
            @Parameter(description = "Year to fetch holidays for", example = "2026")
            @RequestParam(required = false) Integer year) {

        int targetYear = year != null ? year : LocalDate.now().getYear();
        List<HolidayResponseDTO> holidays = holidayService.getHolidaysByYear(targetYear);
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming holidays (from today onwards)")
    public ResponseEntity<List<HolidayResponseDTO>> getUpcomingHolidays() {

        List<HolidayResponseDTO> holidays = holidayService.getUpcomingHolidays();
        return ResponseEntity.ok(holidays);
    }
}
