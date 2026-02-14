package com.finarg.investments.etf.controller;

import com.finarg.investments.etf.dto.EtfDTO;
import com.finarg.investments.etf.service.EtfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/investments/etf")
@RequiredArgsConstructor
@Tag(name = "ETF", description = "Exchange-Traded Funds data")
public class EtfController {
    private final EtfService etfService;

    @GetMapping("/popular")
    @Operation(summary = "Get popular ETFs")
    public ResponseEntity<List<EtfDTO>> getPopularEtfs() {
        return ResponseEntity.ok(etfService.getPopularEtfs());
    }
}
