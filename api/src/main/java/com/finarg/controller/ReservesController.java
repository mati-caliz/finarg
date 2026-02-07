package com.finarg.controller;

import com.finarg.client.DatosGobArClient;
import com.finarg.model.dto.GovernmentDTO;
import com.finarg.model.dto.ReservesDTO;
import com.finarg.service.GovernmentsService;
import com.finarg.service.ReservesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reserves")
@RequiredArgsConstructor
@Tag(name = "Reserves", description = "BCRA Reserves")
@Validated
public class ReservesController {

    private final ReservesService reservesService;
    private final GovernmentsService governmentsService;

    @GetMapping
    @Operation(summary = "Get current reserves by country")
    public ResponseEntity<ReservesDTO> getReserves(
            @RequestParam(defaultValue = "ar") String country) {
        return ResponseEntity.ok(reservesService.getCurrentReserves(country));
    }

    @GetMapping("/history")
    @Operation(summary = "Get reserves history")
    public ResponseEntity<List<DatosGobArClient.SeriesDataPoint>> getHistory(
            @RequestParam(defaultValue = "30") @Min(1) @Max(365) int days) {
        return ResponseEntity.ok(reservesService.getHistory(days));
    }

    @GetMapping("/governments")
    @Operation(summary = "Get government periods for chart visualization")
    public ResponseEntity<List<GovernmentDTO>> getGovernments(
            @RequestParam(defaultValue = "ar") String country) {
        return ResponseEntity.ok(governmentsService.getGovernments(country));
    }
}
