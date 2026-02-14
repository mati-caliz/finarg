package com.finarg.investments.metals.controller;

import com.finarg.investments.metals.dto.MetalDTO;
import com.finarg.investments.metals.service.MetalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/investments/metals")
@RequiredArgsConstructor
@Tag(name = "Metals", description = "Precious metals prices")
public class MetalController {
    private final MetalService metalService;

    @GetMapping
    @Operation(summary = "Get current precious metals prices")
    public ResponseEntity<List<MetalDTO>> getAllMetals() {
        return ResponseEntity.ok(metalService.getAllMetals());
    }
}
