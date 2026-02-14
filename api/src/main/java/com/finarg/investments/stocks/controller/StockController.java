package com.finarg.investments.stocks.controller;

import com.finarg.investments.stocks.dto.StockDTO;
import com.finarg.investments.stocks.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/investments/stocks")
@RequiredArgsConstructor
@Tag(name = "Stocks", description = "Stock market data")
public class StockController {
    private final StockService stockService;

    @GetMapping("/popular")
    @Operation(summary = "Get popular stocks (FAANG)")
    public ResponseEntity<List<StockDTO>> getPopularStocks() {
        return ResponseEntity.ok(stockService.getPopularStocks());
    }
}
