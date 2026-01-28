package com.finarg.controller;

import com.finarg.service.CaucionOptimizerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cauciones")
@RequiredArgsConstructor
@Tag(name = "Cauciones", description = "Optimizador de cauciones bursatiles")
public class CaucionController {

    private final CaucionOptimizerService caucionService;

    @PostMapping("/optimizar")
    @Operation(summary = "Optimizar estrategia de caucion")
    public ResponseEntity<Map<String, Object>> optimizar(
            @RequestParam BigDecimal monto,
            @RequestParam(defaultValue = "7") int plazoDias) {
        return ResponseEntity.ok(caucionService.optimizar(monto, plazoDias));
    }
}
