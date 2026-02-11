package com.finarg.controller;

import com.finarg.model.dto.CryptoDTO;
import com.finarg.service.CryptoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/crypto")
@RequiredArgsConstructor
@Tag(name = "Crypto", description = "Cryptocurrency prices")
public class CryptoController {

    private final CryptoService cryptoService;

    @GetMapping
    @Operation(summary = "Get current cryptocurrency prices")
    public ResponseEntity<List<CryptoDTO>> getCurrentCryptoPrices() {
        List<CryptoDTO> cryptoList = cryptoService.getCurrentCryptoPrices();
        return ResponseEntity.ok(cryptoList);
    }
}
