package com.finarg.controller;

import com.finarg.client.DatosGobArClient;
import com.finarg.model.dto.ReservasDTO;
import com.finarg.service.ReservasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservas")
@RequiredArgsConstructor
@Tag(name = "Reservas", description = "Reservas del BCRA")
public class ReservasController {

    private final ReservasService reservasService;

    @GetMapping
    @Operation(summary = "Obtener reservas actuales del BCRA")
    public ResponseEntity<ReservasDTO> getReservas() {
        return ResponseEntity.ok(reservasService.getReservasActuales());
    }

    @GetMapping("/historico")
    @Operation(summary = "Obtener historico de reservas")
    public ResponseEntity<List<DatosGobArClient.SeriesDataPoint>> getHistorico(
            @RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(reservasService.getHistorico(dias));
    }
}
