package com.finarg.controller;

import com.finarg.model.dto.SimulacionRequestDTO;
import com.finarg.model.dto.SimulacionResponseDTO;
import com.finarg.service.SimuladorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/simulador")
@RequiredArgsConstructor
@Tag(name = "Simulador", description = "Simulador de rendimientos de inversiones")
public class SimuladorController {

    private final SimuladorService simuladorService;

    @PostMapping("/rendimiento")
    @Operation(summary = "Simular rendimiento de una inversion")
    public ResponseEntity<SimulacionResponseDTO> simular(@Valid @RequestBody SimulacionRequestDTO request) {
        return ResponseEntity.ok(simuladorService.simular(request));
    }

    @GetMapping("/tasas")
    @Operation(summary = "Obtener tasas actuales de inversiones")
    public ResponseEntity<List<SimuladorService.TasaActual>> getTasas() {
        return ResponseEntity.ok(simuladorService.getTasasActuales());
    }
}
