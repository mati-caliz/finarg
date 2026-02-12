package com.finarg.realestate.controller;

import com.finarg.realestate.dto.CityDTO;
import com.finarg.realestate.dto.NeighborhoodDTO;
import com.finarg.realestate.dto.PropertyFilterDTO;
import com.finarg.realestate.dto.PropertyPriceResponseDTO;
import com.finarg.realestate.service.PropertyPriceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/real-estate")
@RequiredArgsConstructor
@Tag(name = "Real Estate", description = "Property prices and analysis")
@Validated
public class PropertyPriceController {

    private final PropertyPriceService propertyPriceService;

    @PostMapping("/prices")
    @Operation(summary = "Get property prices by filters",
               description = "Returns property prices, statistics and list of properties matching the filters")
    public ResponseEntity<PropertyPriceResponseDTO> getPropertyPrices(
            @Valid @RequestBody PropertyFilterDTO filters) {
        return ResponseEntity.ok(propertyPriceService.getPropertyPrices(filters));
    }

    @GetMapping("/cities")
    @Operation(summary = "Get available cities",
               description = "Returns list of cities where real estate data is available")
    public ResponseEntity<List<CityDTO>> getAvailableCities() {
        return ResponseEntity.ok(propertyPriceService.getAvailableCities());
    }

    @GetMapping("/cities/{cityCode}/neighborhoods")
    @Operation(summary = "Get neighborhoods by city",
               description = "Returns list of neighborhoods for a specific city")
    public ResponseEntity<List<NeighborhoodDTO>> getNeighborhoodsByCity(
            @PathVariable String cityCode) {
        return ResponseEntity.ok(propertyPriceService.getNeighborhoodsByCity(cityCode));
    }
}
