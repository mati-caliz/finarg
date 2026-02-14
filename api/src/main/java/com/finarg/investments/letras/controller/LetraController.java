package com.finarg.investments.letras.controller;

import com.finarg.investments.letras.dto.LetraDTO;
import com.finarg.investments.letras.service.LetraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/investments/letras")
@RequiredArgsConstructor
@Tag(name = "Letras", description = "Argentine Treasury Bills")
public class LetraController {
    private final LetraService letraService;

    @GetMapping
    @Operation(summary = "Get treasury bills")
    public ResponseEntity<List<LetraDTO>> getAllLetras() {
        return ResponseEntity.ok(letraService.getAllLetras());
    }
}
