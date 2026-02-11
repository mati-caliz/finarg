package com.finarg.calculators.incometax.controller;

import com.finarg.calculators.incometax.dto.IncomeTaxRequestDTO;
import com.finarg.calculators.incometax.dto.IncomeTaxResponseDTO;
import com.finarg.calculators.incometax.service.IncomeTaxCalculatorService;
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
@RequestMapping("/api/v1/income-tax")
@RequiredArgsConstructor
@Tag(name = "Income Tax", description = "Income tax calculator")
public class IncomeTaxController {

    private final IncomeTaxCalculatorService incomeTaxService;

    @PostMapping("/calculate")
    @Operation(summary = "Calculate income tax")
    public ResponseEntity<IncomeTaxResponseDTO> calculate(@Valid @RequestBody IncomeTaxRequestDTO request) {
        return ResponseEntity.ok(incomeTaxService.calculate(request));
    }
}
