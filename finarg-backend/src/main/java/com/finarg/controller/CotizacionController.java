package com.finarg.controller;

import com.finarg.model.dto.BrechaDTO;
import com.finarg.model.dto.CotizacionDTO;
import com.finarg.model.entity.CotizacionHistorica;
import com.finarg.model.enums.TipoDolar;
import com.finarg.service.CotizacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cotizaciones")
@RequiredArgsConstructor
@Tag(name = "Cotizaciones", description = "Cotizaciones de dolar en tiempo real")
public class CotizacionController {

    private final CotizacionService cotizacionService;

    @GetMapping
    @Operation(summary = "Obtener todas las cotizaciones de dolar")
    public ResponseEntity<List<CotizacionDTO>> getAllCotizaciones() {
        return ResponseEntity.ok(cotizacionService.getAllCotizaciones());
    }

    @GetMapping("/{tipo}")
    @Operation(summary = "Obtener cotizacion por tipo de dolar")
    public ResponseEntity<CotizacionDTO> getCotizacion(@PathVariable String tipo) {
        TipoDolar tipoDolar = TipoDolar.fromCodigo(tipo);
        CotizacionDTO cotizacion = cotizacionService.getCotizacion(tipoDolar);
        if (cotizacion == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(cotizacion);
    }

    @GetMapping("/brecha")
    @Operation(summary = "Obtener semaforo de brecha cambiaria")
    public ResponseEntity<BrechaDTO> getBrecha() {
        return ResponseEntity.ok(cotizacionService.calcularBrecha());
    }

    @GetMapping("/historico/{tipo}")
    @Operation(summary = "Obtener historico de cotizaciones")
    public ResponseEntity<List<CotizacionHistorica>> getHistorico(
            @PathVariable String tipo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        TipoDolar tipoDolar = TipoDolar.fromCodigo(tipo);
        return ResponseEntity.ok(cotizacionService.getHistorico(tipoDolar, desde, hasta));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Forzar actualizacion del cache")
    public ResponseEntity<Void> refreshCache() {
        cotizacionService.refreshCache();
        return ResponseEntity.ok().build();
    }
}
