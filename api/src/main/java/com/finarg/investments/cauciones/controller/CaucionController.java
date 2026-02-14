package com.finarg.investments.cauciones.controller;

import com.finarg.investments.cauciones.dto.CaucionDTO;
import com.finarg.investments.cauciones.service.CaucionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/investments/cauciones")
@RequiredArgsConstructor
@Tag(name = "Cauciones", description = "Repo Rates")
public class CaucionController {
    private final CaucionService caucionService;

    @GetMapping
    @Operation(summary = "Get repo rates")
    public ResponseEntity<List<CaucionDTO>> getAllCauciones() {
        return ResponseEntity.ok(caucionService.getAllCauciones());
    }
}
