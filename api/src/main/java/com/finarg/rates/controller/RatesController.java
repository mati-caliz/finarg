package com.finarg.rates.controller;

import com.finarg.rates.dto.RateDTO;
import com.finarg.shared.enums.Country;
import com.finarg.rates.service.RatesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rates")
@RequiredArgsConstructor
@Tag(name = "Rates", description = "TNA rates comparator - banks and wallets")
public class RatesController {

    private final RatesService ratesService;

    @GetMapping("/fixed-term")
    @Operation(summary = "Get fixed-term deposit rates by bank")
    public ResponseEntity<List<RateDTO>> getFixedTermRates() {
        Country c = mapCountry();
        return ResponseEntity.ok(ratesService.getFixedTermRates(c));
    }

    @GetMapping("/wallets")
    @Operation(summary = "Get wallet/fintech TNA rates")
    public ResponseEntity<List<RateDTO>> getWalletRates() {
        Country c = mapCountry();
        return ResponseEntity.ok(ratesService.getWalletRates(c));
    }

    @GetMapping("/usd-accounts")
    @Operation(summary = "Get USD remunerated accounts and yields")
    public ResponseEntity<List<RateDTO>> getUsdAccountRates() {
        Country c = mapCountry();
        return ResponseEntity.ok(ratesService.getUsdAccountRates(c));
    }

    @GetMapping("/uva-mortgages")
    @Operation(summary = "Get UVA mortgage loan rates")
    public ResponseEntity<List<RateDTO>> getUvaMortgageRates() {
        Country c = mapCountry();
        return ResponseEntity.ok(ratesService.getUvaMortgageRates(c));
    }

    private static Country mapCountry() {
        return Country.ARGENTINA;
    }
}
