package com.finarg.investments.cedear.controller;

import com.finarg.investments.cedear.dto.CedearDTO;
import com.finarg.investments.cedear.service.CedearService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/investments/cedears")
@RequiredArgsConstructor
@Tag(name = "CEDEARs", description = "Argentine Depositary Receipts")
public class CedearController {
    private final CedearService cedearService;

    @GetMapping
    @Operation(summary = "Get popular CEDEARs")
    public ResponseEntity<List<CedearDTO>> getAllCedears() {
        return ResponseEntity.ok(cedearService.getAllCedears());
    }
}
