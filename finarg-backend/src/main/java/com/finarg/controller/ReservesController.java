package com.finarg.controller;

import com.finarg.client.DatosGobArClient;
import com.finarg.model.dto.ReservesDTO;
import com.finarg.service.ReservesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reserves")
@RequiredArgsConstructor
@Tag(name = "Reserves", description = "BCRA Reserves")
public class ReservesController {

    private final ReservesService reservesService;

    @GetMapping
    @Operation(summary = "Get current BCRA reserves")
    public ResponseEntity<ReservesDTO> getReserves() {
        return ResponseEntity.ok(reservesService.getCurrentReserves());
    }

    @GetMapping("/history")
    @Operation(summary = "Get reserves history")
    public ResponseEntity<List<DatosGobArClient.SeriesDataPoint>> getHistory(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(reservesService.getHistory(days));
    }
}
