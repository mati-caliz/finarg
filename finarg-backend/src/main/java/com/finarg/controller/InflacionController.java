package com.finarg.controller;

import com.finarg.model.dto.AjusteInflacionDTO;
import com.finarg.model.dto.InflacionDTO;
import com.finarg.service.InflacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inflacion")
@RequiredArgsConstructor
@Tag(name = "Inflacion", description = "Datos de inflacion y ajuste por IPC")
public class InflacionController {

    private final InflacionService inflacionService;

    @GetMapping("/actual")
    @Operation(summary = "Obtener inflacion del ultimo mes")
    public ResponseEntity<InflacionDTO> getInflacionActual() {
        return ResponseEntity.ok(inflacionService.getInflacionActual());
    }

    @GetMapping("/mensual")
    @Operation(summary = "Obtener inflacion mensual historica")
    public ResponseEntity<List<InflacionDTO>> getInflacionMensual(
            @RequestParam(defaultValue = "12") int meses) {
        return ResponseEntity.ok(inflacionService.getInflacionMensual(meses));
    }

    @GetMapping("/interanual")
    @Operation(summary = "Obtener inflacion interanual historica")
    public ResponseEntity<List<InflacionDTO>> getInflacionInteranual() {
        return ResponseEntity.ok(inflacionService.getInflacionInteranual());
    }

    @PostMapping("/ajustar")
    @Operation(summary = "Ajustar monto por inflacion entre dos fechas")
    public ResponseEntity<AjusteInflacionDTO> ajustarPorInflacion(
            @RequestParam BigDecimal monto,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaOrigen,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDestino) {
        return ResponseEntity.ok(inflacionService.ajustarPorInflacion(monto, fechaOrigen, fechaDestino));
    }
}
