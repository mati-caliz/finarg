package com.finarg.quotes.controller;

import com.finarg.quotes.dto.ExchangeRateComparisonDTO;
import com.finarg.shared.enums.Country;
import com.finarg.quotes.service.ExchangeRateComparisonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

@RestController
@Validated
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Exchange Rate Comparison", description = "Compare different exchange rates")
public class ExchangeRateComparisonController {

    private final ExchangeRateComparisonService exchangeRateComparisonService;

    @GetMapping("/{country}/exchange-rates/comparison")
    @Operation(summary = "Compare all exchange rates for a country")
    public ResponseEntity<ExchangeRateComparisonDTO> compareRates(@PathVariable String country) {
        Country countryEnum = Country.fromCode(country);
        return ResponseEntity.ok(exchangeRateComparisonService.compareRates(countryEnum));
    }
}
