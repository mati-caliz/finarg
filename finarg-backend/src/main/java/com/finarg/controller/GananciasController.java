package com.finarg.controller;

import com.finarg.model.dto.GananciasRequestDTO;
import com.finarg.model.dto.GananciasResponseDTO;
import com.finarg.service.GananciasCalculatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ganancias")
@RequiredArgsConstructor
@Tag(name = "Ganancias", description = "Calculadora de impuesto a las ganancias")
public class GananciasController {

    private final GananciasCalculatorService gananciasService;

    @PostMapping("/calcular")
    @Operation(summary = "Calcular impuesto a las ganancias")
    public ResponseEntity<GananciasResponseDTO> calcular(@Valid @RequestBody GananciasRequestDTO request) {
        return ResponseEntity.ok(gananciasService.calcular(request));
    }
}
