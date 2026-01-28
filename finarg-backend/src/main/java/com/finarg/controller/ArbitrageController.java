package com.finarg.controller;

import com.finarg.model.dto.ArbitrageDTO;
import com.finarg.service.ArbitrageDetectorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/arbitrage")
@RequiredArgsConstructor
@Tag(name = "Arbitrage", description = "Arbitrage opportunity detector")
public class ArbitrageController {

    private final ArbitrageDetectorService arbitrageService;

    @GetMapping("/opportunities")
    @Operation(summary = "Get current arbitrage opportunities")
    public ResponseEntity<List<ArbitrageDTO>> getOpportunities() {
        return ResponseEntity.ok(arbitrageService.detectOpportunities());
    }
}
