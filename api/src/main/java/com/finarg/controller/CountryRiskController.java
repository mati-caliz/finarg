package com.finarg.controller;

import com.finarg.model.dto.CountryRiskDTO;
import com.finarg.service.CountryRiskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/country-risk")
@RequiredArgsConstructor
@Tag(name = "Country Risk", description = "Country risk indicator")
public class CountryRiskController {

    private final CountryRiskService countryRiskService;

    @GetMapping
    @Operation(summary = "Get current country risk")
    public ResponseEntity<CountryRiskDTO> getCurrentCountryRisk() {
        CountryRiskDTO dto = countryRiskService.getCurrentCountryRisk();
        return ResponseEntity.ok(dto);
    }
}
