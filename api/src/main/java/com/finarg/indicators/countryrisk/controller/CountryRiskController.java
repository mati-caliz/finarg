package com.finarg.indicators.countryrisk.controller;

import com.finarg.indicators.countryrisk.dto.CountryRiskDTO;
import com.finarg.indicators.countryrisk.dto.GovernmentDTO;
import com.finarg.indicators.countryrisk.service.CountryRiskService;
import com.finarg.indicators.countryrisk.service.GovernmentsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/country-risk")
@RequiredArgsConstructor
@Tag(name = "Country Risk", description = "Country risk indicator")
public class CountryRiskController {

    private final CountryRiskService countryRiskService;
    private final GovernmentsService governmentsService;

    @GetMapping
    @Operation(summary = "Get current country risk")
    public ResponseEntity<CountryRiskDTO> getCurrentCountryRisk() {
        CountryRiskDTO dto = countryRiskService.getCurrentCountryRisk();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/history")
    @Operation(summary = "Get country risk history")
    public ResponseEntity<List<CountryRiskDTO>> getCountryRiskHistory() {
        List<CountryRiskDTO> history = countryRiskService.getCountryRiskHistory();
        return ResponseEntity.ok(history);
    }

    @GetMapping("/governments")
    @Operation(summary = "Get government periods for chart visualization")
    public ResponseEntity<List<GovernmentDTO>> getGovernments(
            @RequestParam(defaultValue = "ar") String country) {
        return ResponseEntity.ok(governmentsService.getGovernments(country));
    }
}
