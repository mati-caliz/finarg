package com.finarg.realestate.controller;

import com.finarg.realestate.dto.ROIRequestDTO;
import com.finarg.realestate.dto.ROIResponseDTO;
import com.finarg.realestate.service.RealEstateROICalculatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/real-estate")
@RequiredArgsConstructor
@Tag(name = "Real Estate ROI", description = "Buy vs Rent calculator")
public class RealEstateROIController {

    private final RealEstateROICalculatorService roiService;

    @PostMapping("/roi/calculate")
    @Operation(summary = "Calculate ROI: Buy vs Rent",
               description = "Calculates and compares the financial outcomes of buying vs renting a property")
    public ResponseEntity<ROIResponseDTO> calculateROI(
            @Valid @RequestBody ROIRequestDTO request) {
        return ResponseEntity.ok(roiService.calculateROI(request));
    }
}
