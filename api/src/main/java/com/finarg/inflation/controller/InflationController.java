package com.finarg.inflation.controller;

import com.finarg.model.dto.GovernmentDTO;
import com.finarg.inflation.dto.InflationAdjustmentDTO;
import com.finarg.inflation.dto.InflationDTO;
import com.finarg.service.GovernmentsService;
import com.finarg.inflation.service.InflationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inflation")
@RequiredArgsConstructor
@Tag(name = "Inflation", description = "Inflation data and CPI adjustment")
@Validated
public class InflationController {

    private final InflationService inflationService;
    private final GovernmentsService governmentsService;

    @GetMapping("/current")
    @Operation(summary = "Get current month inflation")
    public ResponseEntity<InflationDTO> getCurrentInflation() {
        return ResponseEntity.ok(inflationService.getCurrentInflation());
    }

    @GetMapping("/monthly")
    @Operation(summary = "Get monthly historical inflation")
    public ResponseEntity<List<InflationDTO>> getMonthlyInflation(
            @RequestParam(defaultValue = "12") @Min(1) @Max(120) int months) {
        return ResponseEntity.ok(inflationService.getMonthlyInflation(months));
    }

    @GetMapping("/year-over-year")
    @Operation(summary = "Get year over year historical inflation")
    public ResponseEntity<List<InflationDTO>> getYearOverYearInflation() {
        return ResponseEntity.ok(inflationService.getYearOverYearInflation());
    }

    @PostMapping("/adjust")
    @Operation(summary = "Adjust amount for inflation between two dates")
    public ResponseEntity<InflationAdjustmentDTO> adjustForInflation(
            @RequestParam BigDecimal amount,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(inflationService.adjustForInflation(amount, fromDate, toDate));
    }

    @GetMapping("/governments")
    @Operation(summary = "Get government periods for chart visualization")
    public ResponseEntity<List<GovernmentDTO>> getGovernments(
            @RequestParam(defaultValue = "ar") String country) {
        return ResponseEntity.ok(governmentsService.getGovernments(country));
    }
}
