package com.finarg.controller;

import com.finarg.model.dto.GapDTO;
import com.finarg.model.dto.QuoteDTO;
import com.finarg.model.entity.QuoteHistory;
import com.finarg.model.enums.Country;
import com.finarg.model.enums.CurrencyType;
import com.finarg.service.QuoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Quotes", description = "Real-time currency quotes")
public class QuoteController {

    private final QuoteService quoteService;

    @GetMapping("/{country}/quotes")
    @Operation(summary = "Get all quotes by country")
    public ResponseEntity<List<QuoteDTO>> getAllQuotesByCountry(@PathVariable String country) {
        Country countryEnum = Country.fromCode(country);
        return ResponseEntity.ok(quoteService.getAllQuotes(countryEnum));
    }

    @GetMapping("/{country}/quotes/{type}")
    @Operation(summary = "Get quote by type and country")
    public ResponseEntity<QuoteDTO> getQuoteByCountry(
            @PathVariable String country,
            @PathVariable String type) {
        Country countryEnum = Country.fromCode(country);
        CurrencyType currencyType = CurrencyType.fromCode(type, countryEnum);
        QuoteDTO quote = quoteService.getQuote(countryEnum, currencyType);
        if (quote == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(quote);
    }

    @GetMapping("/{country}/quotes/gap")
    @Operation(summary = "Get exchange gap indicator by country")
    public ResponseEntity<GapDTO> getGapByCountry(@PathVariable String country) {
        Country countryEnum = Country.fromCode(country);
        return ResponseEntity.ok(quoteService.calculateGap(countryEnum));
    }

    @GetMapping("/quotes/history/{type}")
    @Operation(summary = "Get quote history")
    public ResponseEntity<List<QuoteHistory>> getHistory(
            @PathVariable String type,
            @RequestParam String country,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Country countryEnum = Country.fromCode(country);
        CurrencyType currencyType = CurrencyType.fromCode(type, countryEnum);
        return ResponseEntity.ok(quoteService.getHistory(currencyType, from, to));
    }

    @PostMapping("/quotes/refresh")
    @Operation(summary = "Force cache refresh")
    public ResponseEntity<Void> refreshCache() {
        quoteService.refreshCache();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/countries")
    @Operation(summary = "Get list of available countries")
    public ResponseEntity<List<CountryInfo>> getCountries() {
        List<CountryInfo> countries = Arrays.stream(Country.values())
                .map(c -> new CountryInfo(
                        c.getCode(),
                        c.getName(),
                        c.getLocalCurrency(),
                        c.getLocale(),
                        Arrays.stream(CurrencyType.valuesForCountry(c))
                                .map(t -> new CurrencyTypeInfo(
                                        t.getCode(),
                                        t.getName(),
                                        t.getBaseCurrency(),
                                        t.isHasHistory()
                                ))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(countries);
    }

    public record CountryInfo(
            String code,
            String name,
            String localCurrency,
            String locale,
            List<CurrencyTypeInfo> currencyTypes
    ) { }

    public record CurrencyTypeInfo(
            String code,
            String name,
            String baseCurrency,
            Boolean hasHistory
    ) { }
}
