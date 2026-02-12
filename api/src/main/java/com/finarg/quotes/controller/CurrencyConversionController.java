package com.finarg.quotes.controller;

import com.finarg.quotes.dto.CurrencyConversionRequestDTO;
import com.finarg.quotes.dto.CurrencyConversionResponseDTO;
import com.finarg.quotes.service.CurrencyConversionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/currency")
@RequiredArgsConstructor
@Validated
@Tag(name = "Currency Conversion", description = "Universal currency converter")
public class CurrencyConversionController {

    private final CurrencyConversionService currencyConversionService;

    @PostMapping("/convert")
    @Operation(summary = "Convert between any two currencies",
            description = "Supports same-country and cross-country conversions with customizable buy/sell price types")
    public ResponseEntity<CurrencyConversionResponseDTO> convert(
            @Valid @RequestBody CurrencyConversionRequestDTO request) {
        CurrencyConversionResponseDTO response = currencyConversionService.convert(request);
        return ResponseEntity.ok(response);
    }
}
