package com.finarg.investments.bonds.controller;

import com.finarg.investments.bonds.dto.BondDTO;
import com.finarg.investments.bonds.service.BondService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/investments/bonds")
@RequiredArgsConstructor
@Tag(name = "Bonds", description = "Government bonds data")
public class BondController {
    private final BondService bondService;

    @GetMapping
    @Operation(summary = "Get Argentine government bonds")
    public ResponseEntity<List<BondDTO>> getArgentineBonds() {
        return ResponseEntity.ok(bondService.getArgentineBonds());
    }
}
