package com.finarg.controller;

import com.finarg.model.dto.ArbitrajeDTO;
import com.finarg.service.ArbitrajeDetectorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/arbitraje")
@RequiredArgsConstructor
@Tag(name = "Arbitraje", description = "Detector de oportunidades de arbitraje")
public class ArbitrajeController {

    private final ArbitrajeDetectorService arbitrajeService;

    @GetMapping("/oportunidades")
    @Operation(summary = "Obtener oportunidades de arbitraje actuales")
    public ResponseEntity<List<ArbitrajeDTO>> getOportunidades() {
        return ResponseEntity.ok(arbitrajeService.detectarOportunidades());
    }
}
