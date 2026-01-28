package com.finarg.controller;

import com.finarg.service.CaucionOptimizerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/repos")
@RequiredArgsConstructor
@Tag(name = "Repos", description = "Stock market repo optimizer")
public class CaucionController {

    private final CaucionOptimizerService caucionService;

    @PostMapping("/optimize")
    @Operation(summary = "Optimize repo strategy")
    public ResponseEntity<Map<String, Object>> optimize(
            @RequestParam BigDecimal amount,
            @RequestParam(defaultValue = "7") int termDays) {
        return ResponseEntity.ok(caucionService.optimize(amount, termDays));
    }
}
