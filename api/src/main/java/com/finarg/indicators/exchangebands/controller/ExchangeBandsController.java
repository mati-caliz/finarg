package com.finarg.indicators.exchangebands.controller;

import com.finarg.indicators.exchangebands.dto.ExchangeBandsDTO;
import com.finarg.indicators.exchangebands.service.ExchangeBandsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/exchange-bands")
@RequiredArgsConstructor
@Tag(name = "Exchange Bands", description = "USD exchange bands information")
public class ExchangeBandsController {

    private final ExchangeBandsService exchangeBandsService;

    @GetMapping
    @Operation(summary = "Get current exchange bands")
    public ResponseEntity<ExchangeBandsDTO> getCurrentBands() {
        return ResponseEntity.ok(exchangeBandsService.getCurrentBands());
    }
}
